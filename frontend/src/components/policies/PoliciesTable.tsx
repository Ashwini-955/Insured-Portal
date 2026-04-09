'use client';

import { useRouter } from 'next/navigation';
import { Policy } from '@/types';
import { FileText, DollarSign, Eye } from 'lucide-react';

interface PoliciesTableProps {
  readonly policies: readonly Policy[];
  readonly onViewDetails: (policy: Policy) => void;
}

export function PoliciesTable({ policies, onViewDetails }: PoliciesTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">Active</span>;
    } else if (s === 'expired' || s === 'cancelled') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">Expired</span>;
    } else if (s === 'pending' || s === 'pending review') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-sm">Pending</span>;
    } else if (s === 'upcoming') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-sm">Upcoming</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 shadow-sm">{status || 'Unknown'}</span>;
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active') return 'Active';
    if (s === 'expired' || s === 'cancelled') return 'Expired';
    if (s === 'pending' || s === 'pending review') return 'Pending';
    if (s === 'upcoming') return 'Upcoming';
    return status || 'Unknown';
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {policies.map((policy) => {
        const policyNum = policy.policyNumber || 'N/A';
        const policyStatus = policy.status || 'Unknown';
        const effectiveDate = policy.effectiveDate || '';
        const expirationDate = policy.expirationDate || '';
        const address = policy.propertyAddress?.addressLine1 || 'No address available';
        const coverages = policy.coverages || [];

        return (
          <div
            key={policy._id || policyNum}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Top Row - Policy Number, Address, and Status */}
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{policyNum}</h3>
                <p className="text-sm text-gray-500">{address}</p>
              </div>
              {getStatusBadge(policyStatus)}
            </div>

            {/* Coverage Summary Row */}
            {coverages.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Coverage Summary:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {coverages.slice(0, 6).map((coverage, idx) => (
                    <div key={coverage.name || `coverage-${idx}`} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-500 font-medium">{coverage.name || `Coverage ${idx + 1}`}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{formatCurrency(coverage.limit || 0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policy Period Row */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Policy Period</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(effectiveDate)} — {formatDate(expirationDate)}
              </p>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => router.push('/claims')}
                className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-10 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
                title="File a new claim"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Claim</span>
              </button>
              <button
                onClick={() => router.push('/billing')}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
                title="Make a payment"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pay</span>
              </button>
              <button
                onClick={() => onViewDetails(policy)}
                className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold h-10 rounded-lg transition-all duration-200"
                title="View policy details"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}