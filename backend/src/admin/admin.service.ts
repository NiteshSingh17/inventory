import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryReportResponseDto } from './dto/inventory-report-response.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getInventoryReport(
    inventoryItemId: string,
  ): Promise<InventoryReportResponseDto> {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const [totalOrders, completedOrders, taskGroupCounts] = await Promise.all([
      this.prisma.order.count({
        where: { inventoryItemId },
      }),
      this.prisma.order.count({
        where: { inventoryItemId, status: 'COMPLETED' },
      }),
      this.prisma.backgroundTask.groupBy({
        by: ['status'],
        where: { inventoryItemId },
        _count: true,
      }),
    ]);

    const taskCounts = { pending: 0, processing: 0, completed: 0, failed: 0 };
    for (const group of taskGroupCounts) {
      taskCounts[group.status.toLowerCase() as keyof typeof taskCounts] =
        group._count;
    }

    const isConsistent =
      item.remainingQuantity + completedOrders === item.totalQuantity;

    return {
      item: {
        id: item.id,
        name: item.name,
        sku: item.sku,
        totalQuantity: item.totalQuantity,
        remainingQuantity: item.remainingQuantity,
        saleStart: item.saleStart,
        saleEnd: item.saleEnd,
        isActive: item.isActive,
        createdAt: item.createdAt,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
      },
      tasks: taskCounts,
      consistency: {
        isConsistent,
        remainingQuantity: item.remainingQuantity,
        completedOrders,
        totalQuantity: item.totalQuantity,
      },
    };
  }
}
