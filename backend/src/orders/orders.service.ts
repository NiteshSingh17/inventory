import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async allOrder() {
    return this.prisma.order.findMany();
  }

  async findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        inventoryItem: {
          select: { id: true, name: true, sku: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateOrderDto) {
    if (!dto.inventoryItemId) {
      throw new BadRequestException('inventoryItemId is required');
    }

    if (!dto.idempotencyKey) {
      throw new BadRequestException('idempotencyKey is required');
    }

    try {
      const order = await this.prisma.$transaction(
        async (tx) => {
          const [lockedItem] = await tx.$queryRaw<
            {
              id: string;
              remainingQuantity: number;
              isActive: boolean;
              saleStart: Date;
              saleEnd: Date;
            }[]
          >`SELECT * FROM "InventoryItem" WHERE id = ${dto.inventoryItemId} FOR UPDATE`;

          if (!lockedItem) {
            throw new BadRequestException('Inventory item not found');
          }

          if (!lockedItem.isActive) {
            throw new BadRequestException('Item is inactive');
          }

          const now = new Date();

          if (now < lockedItem.saleStart) {
            throw new BadRequestException('Sale has not started');
          }

          if (now > lockedItem.saleEnd) {
            throw new BadRequestException('Sale has expired');
          }

          if (lockedItem.remainingQuantity <= 0) {
            throw new ConflictException('Out of stock');
          }

          const previousOrder = await tx.order.findFirst({
            where: {
              idempotencyKey: dto.idempotencyKey,
            },
          });

          if (previousOrder) {
            if (previousOrder.userId !== userId) {
              throw new ConflictException('User id mismatch');
            }

            if (previousOrder.inventoryItemId !== dto.inventoryItemId) {
              throw new ConflictException('Conflict with key');
            }

            if (previousOrder) {
              return previousOrder;
            }
          }

          await tx.inventoryItem.update({
            where: { id: dto.inventoryItemId },
            data: { remainingQuantity: { decrement: 1 } },
          });

          const order = await tx.order.create({
            data: {
              userId,
              inventoryItemId: dto.inventoryItemId,
              idempotencyKey: dto.idempotencyKey,
            },
          });

          await tx.backgroundTask.create({
            data: {
              orderId: order.id,
              inventoryItemId: dto.inventoryItemId,
              idempotencyKey: dto.idempotencyKey,
            },
          });

          return order;
        },
        { maxWait: 5000, timeout: 10000 },
      );

      return order;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;

          if (target?.includes('idempotencyKey')) {
            const existing = await this.prisma.order.findUnique({
              where: { idempotencyKey: dto.idempotencyKey },
            });
            return existing;
          }

          if (
            target?.includes('userId') &&
            target?.includes('inventoryItemId')
          ) {
            throw new ConflictException('Already ordered this item');
          }
        }
      }

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Order creation failed');
    }
  }
}
