'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '@/utils/formatDate';
import { Bell, Mail, FileCheck, Info } from 'lucide-react';

interface LastEmail {
  policyNumber: string;
  timestamp: string;
}

interface LastClaim {
  policyNumber: string;
  claimNumber: string;
  timestamp: string;
}

export default function NotificationsPage() {
  const [lastEmail, setLastEmail] = useState<LastEmail | null>(null);
  const [lastClaim, setLastClaim] = useState<LastClaim | null>(null);

  useEffect(() => {
    const loadState = () => {
      const storedEmail = localStorage.getItem('lastPaymentEmail');
      if (storedEmail) {
        setLastEmail(JSON.parse(storedEmail));
      }
      
      const storedClaim = localStorage.getItem('lastClaimFiled');
      if (storedClaim) {
        setLastClaim(JSON.parse(storedClaim));
      }
    };

    loadState();
    window.addEventListener('notification-updated', loadState);
    window.addEventListener('storage', loadState);

    return () => {
      window.removeEventListener('notification-updated', loadState);
      window.removeEventListener('storage', loadState);
    };
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
          {!lastEmail && !lastClaim ? (
             <div className="px-6 py-12 text-center flex flex-col items-center">
               <Info className="w-10 h-10 text-gray-300 mb-3" />
               <p className="text-gray-500 font-medium text-sm">You have no new notifications.</p>
             </div>
          ) : (
            <>
              {lastClaim && (
                <div className="px-6 py-5 hover:bg-slate-50 transition-colors flex items-start gap-4">
                  <div className="mt-1 p-2 bg-emerald-50 rounded-full border border-emerald-100 flex-shrink-0">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <p className="text-sm font-bold text-gray-900">Claim Successfully Filed</p>
                      <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{formatDate(lastClaim.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      Your new claim <span className="font-bold text-gray-800">#{lastClaim.claimNumber}</span> has been processed for Policy <span className="font-bold text-gray-800">{lastClaim.policyNumber}</span>. We will review the details and get back to you shortly.
                    </p>
                  </div>
                </div>
              )}

              {lastEmail && (
                <div className="px-6 py-5 hover:bg-slate-50 transition-colors flex items-start gap-4">
                  <div className="mt-1 p-2 bg-blue-50 rounded-full border border-blue-100 flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <p className="text-sm font-bold text-gray-900">Payment Confirmation Sent</p>
                      <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{formatDate(lastEmail.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      A payment receipt email has been dispatched for Policy <span className="font-bold text-gray-800">{lastEmail.policyNumber}</span>. Please check your inbox for the transaction details.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}