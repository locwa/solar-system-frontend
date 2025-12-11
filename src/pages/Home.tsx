import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Solar System Management System!</h1>
      {user && (
        <p className="text-lg">Hello, {user.name} ({user.role})!</p>
      )}
      <p className="mt-4">This is your central hub for managing planets, citizens, and proposals.</p>
    </div>
  );
}
