'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { getNotifications, subscribeToNotifications } from '@/lib/notifications';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const notifs = getNotifications();
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    };
    
    updateCount();
    return subscribeToNotifications(updateCount);
  }, []);

  return (
    <header className="sticky top-0 h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 z-40">
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <Link href="/notifications" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Link>
        
        <div className="relative border-l border-slate-200 pl-2 md:pl-4" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.firstName?.[0] || 'U'}
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 py-2 transform opacity-100 scale-100 transition-all duration-200 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
