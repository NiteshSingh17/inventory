'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-context';
import { apiFetch, ApiError } from '@/lib/api';

export default function NewInventoryItemPage() {
  const { currentUser } = useUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    totalQuantity: '',
    remainingQuantity: '',
    saleStart: '',
    saleEnd: '',
    isActive: true,
  });

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="text-center py-12 text-gray-500">
        Only admins can create inventory items
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch('/inventory', currentUser.id, {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          totalQuantity: parseInt(form.totalQuantity, 10),
          remainingQuantity: parseInt(form.remainingQuantity || form.totalQuantity, 10),
          saleStart: new Date(form.saleStart).toISOString(),
          saleEnd: new Date(form.saleEnd).toISOString(),
          isActive: form.isActive,
        }),
      });
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create item');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-6">Create Inventory Item</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 grid gap-4">
        <Field label="Name" error={null}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Field>

        <Field label="SKU" error={null}>
          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Field>

        <Field label="Total Quantity" error={null}>
          <input
            name="totalQuantity"
            type="number"
            min={1}
            value={form.totalQuantity}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Field>

        <Field label="Remaining Quantity" error={null}>
          <input
            name="remainingQuantity"
            type="number"
            min={0}
            value={form.remainingQuantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Defaults to total quantity"
          />
        </Field>

        <Field label="Sale Start" error={null}>
          <input
            name="saleStart"
            type="datetime-local"
            value={form.saleStart}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Field>

        <Field label="Sale End" error={null}>
          <input
            name="saleEnd"
            type="datetime-local"
            value={form.saleEnd}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Field>

        <div className="flex items-center gap-2">
          <input
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label className="text-sm text-gray-700">Active</label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting ? 'Creating...' : 'Create Item'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
