export class CreateOrderDto {
  inventoryItemId: string;
  idempotencyKey: string;
}
