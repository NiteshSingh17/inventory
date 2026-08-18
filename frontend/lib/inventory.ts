import { InventoryItem } from './api';

export type SaleStatus = 'active' | 'not_started' | 'expired' | 'inactive';

export function getSaleStatus(item: InventoryItem): SaleStatus {
  if (!item.isActive) return 'inactive';
  const now = new Date();
  if (now < new Date(item.saleStart)) return 'not_started';
  if (now > new Date(item.saleEnd)) return 'expired';
  return 'active';
}

export function isOrderable(item: InventoryItem): boolean {
  return getSaleStatus(item) === 'active' && item.remainingQuantity > 0;
}

export function saleStatusLabel(status: SaleStatus): string {
  switch (status) {
    case 'active': return 'Active';
    case 'not_started': return 'Not Started';
    case 'expired': return 'Expired';
    case 'inactive': return 'Inactive';
  }
}

export function saleStatusColor(status: SaleStatus): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'not_started': return 'bg-yellow-100 text-yellow-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'inactive': return 'bg-gray-100 text-gray-600';
  }
}
