export class CreateInventoryItemDto {
  name: string;
  sku: string;
  totalQuantity: number;
  remainingQuantity: number;
  saleStart: string;
  saleEnd: string;
  isActive?: boolean;
}
