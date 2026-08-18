'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/lib/user-context';
import { apiFetch, ApiError, InventoryItem } from '@/lib/api';
import {
  getSaleStatus,
  isOrderable,
  saleStatusLabel,
  saleStatusColor,
} from '@/lib/inventory';

export default function HomePage() {
  const { currentUser } = useUser();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await apiFetch('/inventory', currentUser.id);
      setItems(data);
      setError(null);
    } catch {
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    fetchItems();
  }, [currentUser, fetchItems]);

  if (!currentUser) {
    return (
      <div className="text-center py-12 text-gray-500">
        Please select a user from the dropdown above
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading inventory...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Available Items</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">No inventory items found</p>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              userId={currentUser.id}
              onOrdered={fetchItems}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InventoryRow({
  item,
  userId,
  onOrdered,
}: {
  item: InventoryItem;
  userId: string;
  onOrdered: () => void;
}) {
  const [ordering, setOrdering] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);

  const status = getSaleStatus(item);
  const orderable = isOrderable(item);

  const handleOrder = async () => {
    if (!orderable || ordering) return;
    setOrdering(true);
    setFeedback(null);
    setFeedbackType(null);

    try {
      await apiFetch('/orders', userId, {
        method: 'POST',
        body: JSON.stringify({
          inventoryItemId: item.id,
          idempotencyKey: `${userId}-${item.id}-${Date.now()}`,
        }),
      });
      setFeedback('Order placed');
      setFeedbackType('success');
      onOrdered();
    } catch (err) {
      if (err instanceof ApiError) {
        setFeedback(err.message);
      } else {
        setFeedback('Something went wrong');
      }
      setFeedbackType('error');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${saleStatusColor(status)}`}
        >
          {saleStatusLabel(status)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm">
        <span className="text-gray-600">
          Remaining: <span className="font-medium">{item.remainingQuantity}</span> /{' '}
          {item.totalQuantity}
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          Sale: {new Date(item.saleStart).toLocaleDateString()} -{' '}
          {new Date(item.saleEnd).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleOrder}
          disabled={!orderable || ordering}
          className={`px-4 py-1.5 text-sm rounded-md font-medium ${
            orderable && !ordering
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {ordering ? 'Ordering...' : 'Order'}
        </button>
        {feedback && (
          <span
            className={`text-sm ${
              feedbackType === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {feedback}
          </span>
        )}
      </div>
    </div>
  );
}
