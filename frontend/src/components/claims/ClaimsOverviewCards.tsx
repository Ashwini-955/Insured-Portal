import React, { useMemo } from 'react';
import { ClipboardCheck, FileClock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Claim } from '@/types';

export default function ClaimsOverviewCards({ claims = [] }: { claims?: Claim[] }) {
  const activeClaims = useMemo(
    () => claims.filter((c) => !['Approved', 'Rejected', 'Closed'].includes(c.Status ?? '')),
    [claims]
  );
  
  const pendingClaims = useMemo(
    () => claims.filter((c) => (c.Status ?? '').toLowerCase().includes('pending')),
    [claims]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Active Claims */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <ClipboardCheck className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
            <h2 className="text-base font-bold text-gray-900">Active Claims</h2>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 mb-2">{activeClaims.length}</p>
        </div>
        <p className="text-sm text-gray-500 mt-4 leading-relaxed">Claims currently being processed or resolved.</p>
      </div>

      {/* Pending Claims */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <FileClock className="w-5 h-5 text-orange-500" strokeWidth={2.5} />
            <h2 className="text-base font-bold text-gray-900">Pending Claims</h2>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 mb-2">{pendingClaims.length}</p>
        </div>
        <p className="text-sm text-gray-500 mt-4 leading-relaxed">Claims awaiting review or additional information.</p>
      </div>

      {/* File New Claim Context */}
      <div className="bg-[#f0f4fc] rounded-xl border border-gray-200 p-6 flex flex-col justify-center items-center text-center shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Need to File a New Claim?</h2>
        <p className="text-sm text-gray-600 mb-6 px-4">
          Initiate the process for a new claim quickly and effortlessly.
        </p>
        <Link 
          href="/claims/new"
          className="bg-[#2563eb] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors font-semibold text-sm shadow-sm"
        >
          <span>File New Claim</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
