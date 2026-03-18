'use client';

import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4 ml-auto">
        <input
          type="search"
          placeholder="Search policies, claims, or documents"
          className="w-[280px] sm:w-[360px] md:w-[420px] px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button className="p-2" aria-label="Notifications">🔔</button>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700">Logout</button>
      </div>
    </header>
  );
}
