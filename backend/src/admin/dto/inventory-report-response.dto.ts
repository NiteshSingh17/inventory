export class InventoryReportResponseDto {
  item: {
    id: string;
    name: string;
    sku: string;
    totalQuantity: number;
    remainingQuantity: number;
    saleStart: Date;
    saleEnd: Date;
    isActive: boolean;
    createdAt: Date;
  };

  orders: {
    total: number;
    completed: number;
  };

  tasks: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };

  consistency: {
    isConsistent: boolean;
    remainingQuantity: number;
    completedOrders: number;
    totalQuantity: number;
  };
}
