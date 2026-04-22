'use client';

import { Policy } from '@/types';
import { X, FileText, Calendar, MapPin, Shield, Edit2, Mail, User, Phone } from 'lucide-react';
import { addNotification } from '@/lib/notifications';

interface PolicyDetailsModalProps {
  readonly policy: Policy | null;
  readonly onClose: () => void;
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

  const getStatusBadgeClasses = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active') return 'bg-green-500 text-white';
    if (s === 'expired' || s === 'cancelled') return 'bg-red-500 text-white';
    if (s === 'pending' || s === 'pending review') return 'bg-orange-500 text-white';
    return 'bg-gray-100 text-gray-800';
  };

  const statusBadgeClasses = getStatusBadgeClasses(policy.status || '');

  const handleAgentEmailClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (!policy.agent?.email) return;

    addNotification({
      type: 'agent',
      title: 'Agent Email Sent',
      message: `Email sent to your assigned agent <span class="font-bold text-gray-800">${policy.agent.name}</span> for policy <span class="font-bold text-gray-800">${policy.policyNumber}</span>.`,
      policyNumber: policy.policyNumber,
    });
    alert('Email sent successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Policy Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Policy Header with Status */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Policy Number</p>
              <h3 className="text-3xl font-bold text-gray-900">{policy.policyNumber}</h3>
            </div>
            <span className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${statusBadgeClasses}`}>
              {policy.status || 'Unknown'}
            </span>
          </div>

          {/* Policy Identification Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Policy Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Policy Type</p>
                <p className="text-lg font-bold text-gray-900">{policy.policyType || 'N/A'}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-gray-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Account ID</p>
                <p className="text-lg font-bold text-gray-900 font-mono text-sm">{policy.accountId || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Assigned Agent Section */}
          {policy.agent && (
            <section className="bg-gradient-to-br from-blue-50/30 to-white rounded-2xl border border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Assigned Agent
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm text-blue-600">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{policy.agent.name}</p>
                        <p className="text-xs text-gray-500">Professional Insurance Agent</p>
                      </div>
                    </div>
                    {policy.agent.phone && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm text-emerald-600">
                          <Phone size={18} />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{policy.agent.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  {policy.agent.email && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm text-blue-600">
                          <Mail size={18} />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{policy.agent.email}</p>
                      </div>
                      <a 
                        href={`mailto:${policy.agent.email}`}
                        onClick={handleAgentEmailClick}
                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                      >
                        <Mail size={16} />
                        Send Direct Email
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Coverage Period */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Coverage Period
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl p-6 border border-blue-100">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Effective Date</p>
                  <p className="text-xl font-bold text-gray-900">{formatDate(policy.effectiveDate || '')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Expiration Date</p>
                  <p className="text-xl font-bold text-gray-900">{formatDate(policy.expirationDate || '')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Property Address */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Property Address
            </h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-lg font-semibold text-gray-900">{addressStr}</p>
              {cityState && <p className="text-gray-600 mt-2">{cityState}</p>}
            </div>
          </section>

          {/* Coverage Details */}
          {policy.coverages && policy.coverages.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Coverage Limits</h3>
              <div className="space-y-3">
                {policy.coverages.map((coverage, idx) => (
                  <div key={coverage.name || `coverage-${idx}`} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{coverage.name || `Coverage ${idx + 1}`}</span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(coverage.limit || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Actions */}
          <section className="pt-6 border-t border-gray-200">
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95">
              <Edit2 size={18} />
              Request Detail Change
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
