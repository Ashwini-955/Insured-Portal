'use client';

import { useRouter } from 'next/navigation';
import { Policy } from '@/types';
import { FileText, Eye, DollarSign, Calendar, MapPin, Shield, FileCheck, Mail, User, Phone } from 'lucide-react';
import { addNotification } from '@/lib/notifications';

interface PolicyCardProps {
  readonly policy: Policy;
  readonly onViewDetails: (policy: Policy) => void;
}

export function PolicyCard({ policy, onViewDetails }: PolicyCardProps) {
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Header with Policy Number and Status Badge */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="p-2 rounded-full border border-gray-100 bg-gray-50 flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-base truncate" title={policy.policyNumber || 'N/A'}>
              {policy.policyNumber || 'N/A'}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Policy Number</p>
          </div>
        </div>
        {getStatusBadge(policy.status || '')}
      </div>

      {/* Property Address */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg flex-grow">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Property Address</p>
            <p className="text-sm font-medium text-gray-900">{addressStr}</p>
            {cityState && <p className="text-xs text-gray-500 mt-0.5">{cityState}</p>}
          </div>
        </div>
      </div>

      {/* Policy Period */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-blue-600" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coverage Period</p>
        </div>
        <p className="text-sm font-medium text-gray-900">
          {formatDate(policy.effectiveDate || '')} — {formatDate(policy.expirationDate || '')}
        </p>
      </div>

      {/* Coverage Summary */}
      {policy.coverages && policy.coverages.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coverage Limits</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {policy.coverages.slice(0, 2).map((coverage, idx) => (
              <div key={coverage.name || `coverage-${idx}`} className="bg-white rounded-lg p-2.5">
                <p className="text-xs text-gray-500 font-medium">{coverage.name || `Coverage ${idx + 1}`}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{formatCurrency(coverage.limit || 0)}</p>
              </div>
            ))}
          </div>
          {policy.coverages.length > 2 && (
            <p className="text-xs text-gray-400 mt-1.5">+ {policy.coverages.length - 2} more coverage(s)</p>
          )}
        </div>
      )}

      {/* Agent Info */}
      {policy.agent && (
        <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100/50 rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Assigned Agent</p>
                <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{policy.agent.name}</p>
                {policy.agent.phone && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-700 leading-tight mb-1">
                    <Phone className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span>{policy.agent.phone}</span>
                  </p>
                )}
                {policy.agent.email && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-700 leading-tight min-w-0">
                    <Mail className="w-3 h-3 text-blue-600 flex-shrink-0" />
                    <span className="min-w-0 flex-1 truncate" title={policy.agent.email}>{policy.agent.email}</span>
                  </p>
                )}
              </div>
            </div>
            {policy.agent.email && (
              <a 
                href={`mailto:${policy.agent.email}`}
                onClick={handleAgentEmailClick}
                className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                title={`Email agent: ${policy.agent.name}`}
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 mt-auto">
        <button
          onClick={() => router.push(`/claims?policyId=${policy.policyNumber}`)}
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-10 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
          title="File a new insurance claim"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Claim</span>
        </button>
        <button
          onClick={() => router.push(`/billing?policyId=${policy.policyNumber}`)}
          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
          title="Make a payment"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Pay</span>
        </button>
        <button
          onClick={() => onViewDetails(policy)}
          className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold h-10 rounded-lg transition-all duration-200"
          title="View complete policy details"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
}
