'use client';

import { useUser } from '@/lib/user-context';

export default function UserSelector() {
  const { currentUser, users, setCurrentUser, loading } = useUser();

  if (loading) return <div className="text-gray-500">Loading users...</div>;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
      <label className="text-sm font-medium text-gray-700">Current User:</label>
      <select
        value={currentUser?.id || ''}
        onChange={(e) => {
          const user = users.find((u) => u.id === e.target.value);
          if (user) setCurrentUser(user);
        }}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
      {currentUser && (
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          {currentUser.role}
        </span>
      )}
    </div>
  );
}
