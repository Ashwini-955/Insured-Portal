'use client';

import { Policy } from '@/types';
import { X } from 'lucide-react';

interface PolicyDetailsModalProps {
  policy: Policy | null;
  onClose: () => void;
}

export function PolicyDetailsModal({ policy, onClose }: PolicyDetailsModalProps) {
  if (!policy) return null;

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const address = policy.propertyAddress;
  const addressStr = address
    ? `${address.addressLine1}, ${address.city}, ${address.state} ${address.zipCode}`
    : 'No address available';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Policy Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Policy Identification */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Policy Identification</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Policy Number:</span>
                <span className="font-semibold text-gray-900">{policy.policyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Policy Type:</span>
                <span className="font-semibold text-gray-900">{policy.policyType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-gray-900">{policy.status || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account ID:</span>
                <span className="font-semibold text-gray-900">{policy.accountId || 'N/A'}</span>
              </div>
            </div>
          </section>

          {/* Coverage Period */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Coverage Period</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Effective Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(policy.effectiveDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiration Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(policy.expirationDate)}</span>
              </div>
            </div>
          </section>

          {/* Property Address */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Address</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900">{addressStr}</p>
            </div>
          </section>

          {/* Coverage Details */}
          {policy.coverages && policy.coverages.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Coverages</h3>
              <div className="space-y-2">
                {policy.coverages.map((coverage, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-gray-600">{coverage.name || `Coverage ${idx + 1}`}</span>
                    <span className="font-semibold text-gray-900">${coverage.limit?.toLocaleString() || '0'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Request Detail Change */}
          <section className="pt-4 border-t border-gray-200">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
              Request Detail Change
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
