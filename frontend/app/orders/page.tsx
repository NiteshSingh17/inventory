'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/user-context';
import { apiFetch, OrderWithItem } from '@/lib/api';

export default function OrdersPage() {
  const { currentUser } = useUser();
  const [orders, setOrders] = useState<OrderWithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    apiFetch('/orders', currentUser.id)
      .then((data) => setOrders(data))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-12 text-gray-500">
        Please select a user from the dropdown above
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet</p>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{order.inventoryItem.name}</p>
                  <p className="text-sm text-gray-500">SKU: {order.inventoryItem.sku}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </span>
  );
}
