'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, apiFetch } from '@/lib/api';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    fetchUsers(storedUserId);
  }, []);

  const fetchUsers = async (storedUserId?: string | null) => {
    try {
      const data = await apiFetch('/users', storedUserId || '');
      setUsers(data);
      if (storedUserId) {
        const found = data.find((u: User) => u.id === storedUserId);
        if (found) setCurrentUser(found);
      }
    } catch {
      // users fetch failed, will remain empty
    } finally {
      setLoading(false);
    }
  };

  const handleSetUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUserId', user.id);
  };

  return (
    <UserContext.Provider value={{ currentUser, users, setCurrentUser: handleSetUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
