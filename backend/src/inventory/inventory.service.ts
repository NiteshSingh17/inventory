import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInventoryItemDto) {
    this.validateCreateFields(dto);

    const existing = await this.prisma.inventoryItem.findUnique({
      where: { sku: dto.sku },
    });

    if (existing) {
      throw new ConflictException('SKU already exists');
    }

    return this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        totalQuantity: dto.totalQuantity,
        remainingQuantity: dto.remainingQuantity,
        saleStart: new Date(dto.saleStart),
        saleEnd: new Date(dto.saleEnd),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.inventoryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    const item = await this.findById(id);

    if (dto.sku && dto.sku !== item.sku) {
      const skuTaken = await this.prisma.inventoryItem.findUnique({
        where: { sku: dto.sku },
      });

      if (skuTaken) {
        throw new ConflictException('SKU already exists');
      }
    }

    const totalQty = dto.totalQuantity ?? item.totalQuantity;
    const remainQty = dto.remainingQuantity ?? item.remainingQuantity;

    if (totalQty < 1) {
      throw new BadRequestException('totalQuantity must be greater than 0');
    }

    if (remainQty < 0 || remainQty > totalQty) {
      throw new BadRequestException(
        'remainingQuantity must be between 0 and totalQuantity',
      );
    }

    if (dto.saleStart || dto.saleEnd) {
      const start = new Date(dto.saleStart ?? item.saleStart);
      const end = new Date(dto.saleEnd ?? item.saleEnd);

      if (start >= end) {
        throw new BadRequestException('saleStart must be before saleEnd');
      }
    }

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.totalQuantity !== undefined && {
          totalQuantity: dto.totalQuantity,
        }),
        ...(dto.remainingQuantity !== undefined && {
          remainingQuantity: dto.remainingQuantity,
        }),
        ...(dto.saleStart !== undefined && {
          saleStart: new Date(dto.saleStart),
        }),
        ...(dto.saleEnd !== undefined && { saleEnd: new Date(dto.saleEnd) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async checkItemOrderable(id: string) {
    const item = await this.findById(id);

    if (!item.isActive) {
      throw new BadRequestException('Item is inactive');
    }

    const now = new Date();

    if (now < item.saleStart) {
      throw new BadRequestException('Sale has not started');
    }

    if (now > item.saleEnd) {
      throw new BadRequestException('Sale has expired');
    }

    return item;
  }

  private validateCreateFields(dto: CreateInventoryItemDto) {
    if (!dto.name || !dto.sku) {
      throw new BadRequestException('name and sku are required');
    }

    if (dto.totalQuantity < 1) {
      throw new BadRequestException('totalQuantity must be greater than 0');
    }

    if (
      dto.remainingQuantity < 0 ||
      dto.remainingQuantity > dto.totalQuantity
    ) {
      throw new BadRequestException(
        'remainingQuantity must be between 0 and totalQuantity',
      );
    }

    if (!dto.saleStart || !dto.saleEnd) {
      throw new BadRequestException('saleStart and saleEnd are required');
    }

    const start = new Date(dto.saleStart);
    const end = new Date(dto.saleEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException(
        'Invalid date format for saleStart or saleEnd',
      );
    }

    if (start >= end) {
      throw new BadRequestException('saleStart must be before saleEnd');
    }
  }
}
