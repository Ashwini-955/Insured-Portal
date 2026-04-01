'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '@/utils/formatDate';

interface LastEmail {
  policyNumber: string;
  timestamp: string;
}

export default function NotificationsPage() {
  const [lastEmail, setLastEmail] = useState<LastEmail | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastPaymentEmail');
    if (stored) {
      setLastEmail(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
        <p className="text-gray-500 mt-2 font-medium">Stay updated on your account activities.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Notifications</h2>
        {lastEmail ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              Payment email sent for Policy {lastEmail.policyNumber} on {formatDate(lastEmail.timestamp)}.
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}