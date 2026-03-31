'use client';

import { useRouter } from 'next/navigation';
import { Policy } from '@/types';
import { FileText, Download, AlertCircle } from 'lucide-react';

interface PolicyCardProps {
  policy: Policy;
  onViewDetails: (policy: Policy) => void;
}

export function PolicyCard({ policy, onViewDetails }: PolicyCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'pending review':
        return 'Pending Review';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status || 'Unknown';
    }
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

  const address = policy.propertyAddress;
  const addressStr = address
    ? `${address.addressLine1}, ${address.city}, ${address.state} ${address.zipCode}`
    : 'No address available';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{policy.policyNumber}</h3>
          <p className="text-sm text-gray-600 mt-1">{addressStr}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(policy.status)}`}>
          {getStatusLabel(policy.status)}
        </span>
      </div>

      {/* Coverage Summary */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Coverage Summary:</h4>
        <div className="grid grid-cols-3 gap-4">
          {policy.coverages && policy.coverages.length > 0 ? (
            policy.coverages.map((coverage, idx) => (
              <div key={idx}>
                <p className="text-xs text-gray-600">{coverage.name || `Coverage ${idx + 1}`}</p>
                <p className="text-sm font-semibold text-gray-900">
                  ${coverage.limit?.toLocaleString() || '0'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 col-span-3">No coverage details available</p>
          )}
        </div>
      </div>

      {/* Policy Period */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-2">Policy Period</p>
        <p className="text-sm text-gray-900">
          {formatDate(policy.effectiveDate)} to {formatDate(policy.expirationDate)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => router.push('/claims')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded"
        >
          File New Claim →
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded flex items-center gap-1">
          <AlertCircle size={14} />
          Pay Now
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded flex items-center gap-1">
          <Download size={14} />
          Policy Document
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded flex items-center gap-1">
          <FileText size={14} />
          COI
        </button>
      </div>

      {/* View Details Link */}
      <button
        onClick={() => onViewDetails(policy)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View Details →
      </button>
    </div>
  );
}
