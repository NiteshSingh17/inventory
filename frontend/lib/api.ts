const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch(path: string, userId: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  totalQuantity: number;
  remainingQuantity: number;
  saleStart: string;
  saleEnd: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  inventoryItemId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  idempotencyKey: string;
  createdAt: string;
}

export interface OrderWithItem extends Order {
  inventoryItem: { id: string; name: string; sku: string };
}
