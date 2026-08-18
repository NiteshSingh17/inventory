'use client';

import Link from 'next/link';
import { useUser } from '@/lib/user-context';

export default function NavLinks() {
  const { currentUser } = useUser();

  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/" className="text-gray-600">
        Inventory
      </Link>
      <Link href="/orders" className="text-gray-600">
        My Orders
      </Link>
      {currentUser?.role === 'ADMIN' && (
        <Link href="/inventory/new" className="text-gray-600">
          Create Item
        </Link>
      )}
    </nav>
  );
}
