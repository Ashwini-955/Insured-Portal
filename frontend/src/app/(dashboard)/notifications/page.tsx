'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '@/utils/formatDate';
import { Bell, Mail, FileCheck, Info } from 'lucide-react';
import { getNotifications, markAllAsRead, subscribeToNotifications, type AppNotification } from '@/lib/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const loadState = () => {
      setNotifications(getNotifications());
    };

    loadState();
    
    // Slight delay to mark reading to avoid flashing unread badge on instant click
    const timer = setTimeout(() => {
      markAllAsRead();
    }, 500);

    return subscribeToNotifications(loadState);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
          </div>
          <p className="text-sm text-gray-500 mt-2 font-medium">Stay updated on your important account activities and alerts.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recent Activity</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {notifications.length === 0 ? (
             <div className="px-6 py-12 text-center flex flex-col items-center">
               <Info className="w-10 h-10 text-gray-300 mb-3" />
               <p className="text-gray-500 font-medium text-sm">You have no new notifications.</p>
             </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className={`px-6 py-5 hover:bg-slate-50 transition-colors flex items-start gap-4 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                <div className={`mt-1 p-2 rounded-full border flex-shrink-0 ${notif.type === 'claim' ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                  {notif.type === 'claim' ? <FileCheck className="w-5 h-5 text-emerald-600" /> : <Mail className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{formatDate(notif.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: notif.message }}></p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}