'use client';

import { useRouter } from 'next/navigation';
import { Policy } from '@/types';
import { FileText, Download, FileCheck, Eye, DollarSign, Calendar, MapPin, Shield } from 'lucide-react';

interface PolicyCardProps {
  readonly policy: Policy;
  readonly onViewDetails: (policy: Policy) => void;
}

export function PolicyCard({ policy, onViewDetails }: PolicyCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active') {
      return { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
    } else if (s === 'expired' || s === 'cancelled') {
      return { bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
    } else if (s === 'pending' || s === 'pending review') {
      return { bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' };
    } else if (s === 'upcoming') {
      return { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' };
    }
    return { bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' };
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

  const address = policy.propertyAddress;
  const addressStr = address
    ? `${address.addressLine1}`
    : 'No address available';
  const cityState = address
    ? `${address.city}, ${address.state} ${address.zipCode}`
    : '';

  const statusColors = getStatusColor(policy.status || '');
  const statusLabel = getStatusLabel(policy.status || '');

  return (
    <div className={`${statusColors.bg} border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden`}>
      {/* Status Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${statusColors.dot}`}></div>

      {/* Header with Policy Number and Status Badge */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Policy Number</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 break-words">{policy.policyNumber || 'N/A'}</p>
        </div>
        <span className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${statusColors.badge}`}>
          <span className={`inline-block w-2 h-2 ${statusColors.dot} rounded-full mr-2`}></span>
          {statusLabel}
        </span>
      </div>

      {/* Property Address */}
      <div className="mb-5 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-start gap-2 mb-2">
          <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Property Address</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{addressStr}</p>
            {cityState && <p className="text-xs text-gray-600">{cityState}</p>}
          </div>
        </div>
      </div>

      {/* Policy Period */}
      <div className="mb-5 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} className="text-blue-600" />
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Coverage Period</p>
        </div>
        <p className="text-sm font-medium text-gray-900">
          {formatDate(policy.effectiveDate || '')} — {formatDate(policy.expirationDate || '')}
        </p>
      </div>

      {/* Coverage Summary */}
      {policy.coverages && policy.coverages.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck size={16} className="text-emerald-600" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Coverage Limits</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {policy.coverages.slice(0, 2).map((coverage, idx) => (
              <div key={coverage.name || `coverage-${idx}`} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 font-medium">{coverage.name || `Coverage ${idx + 1}`}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(coverage.limit || 0)}</p>
              </div>
            ))}
          </div>
          {policy.coverages.length > 2 && (
            <p className="text-xs text-gray-500 mt-2">+ {policy.coverages.length - 2} more coverage(s)</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => router.push('/claims')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-3 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
            title="File a new insurance claim"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Claim</span>
          </button>
          <button
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
            title="Make a payment"
          >
            <DollarSign size={14} />
            <span className="hidden sm:inline">Pay</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold py-2.5 px-3 rounded-lg transition-all duration-200"
            title="Download policy document"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={() => onViewDetails(policy)}
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold py-2.5 px-3 rounded-lg transition-all duration-200"
            title="View complete policy details"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}