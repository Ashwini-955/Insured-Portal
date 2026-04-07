"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6">
      
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Right section */}
      <div className="flex items-center gap-4 ml-auto">
        
        {/* Search */}
        <input
          type="search"
          placeholder="Search policies, claims, or documents"
          className="w-[200px] sm:w-[280px] md:w-[360px] lg:w-[420px] px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        {/* Notification */}
        <button className="p-2" aria-label="Notifications">🔔</button>

        {/* User Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <User className="w-5 h-5 text-gray-700" />
          </button>

          {/* Dropdown */}
          {openMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border p-4 z-50 animate-in fade-in zoom-in-95">
              
              {/* User Info */}
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "user@email.com"}
                </p>
              </div>

              <hr className="my-2" />

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full text-left text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}