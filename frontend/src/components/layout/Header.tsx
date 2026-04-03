'use client';

import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6">
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex items-center gap-4 ml-auto">
        <input
          type="search"
          placeholder="Search policies, claims, or documents"
          className="w-[200px] sm:w-[280px] md:w-[360px] lg:w-[420px] px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button className="p-2" aria-label="Notifications">🔔</button>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700">Logout</button>
      </div>
    </header>
  );
}
