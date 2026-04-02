'use client';

import { Claim } from '@/types';
import { X, FileText, Calendar, MapPin, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';

interface ClaimDetailsModalProps {
  readonly claim: Claim | null;
  readonly onClose: () => void;
}

export function ClaimDetailsModal({ claim, onClose }: ClaimDetailsModalProps) {
  if (!claim) return null;

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active' || s === 'open') {
      return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
    } else if (s.includes('pending')) {
      return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
    } else if (s === 'rejected' || s === 'denied') {
      return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
    } else if (s === 'approved' || s === 'closed') {
      return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
  };

  const statusColors = getStatusColor(claim.Status || '');
  const statusLower = (claim.Status || '').toLowerCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-8 py-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <ShieldAlert size={28} className="text-blue-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Claim Details</h2>
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
          {/* Claim Header with Status */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Claim Number</p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{claim.ClaimNumber}</h3>
            </div>
            <span className={`self-start flex-shrink-0 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap ${statusColors.bg} ${statusColors.text}`}>
              <span className={`inline-block w-3 h-3 ${statusColors.dot} rounded-full mr-2`}></span>
              {claim.Status || 'Unknown'}
            </span>
          </div>

          {/* Timeline */}
          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider flex justify-center">Claim Timeline</h3>
            <div className="flex items-center justify-center max-w-lg mx-auto">
              <div className={`flex flex-col items-center flex-1 justify-center ${statusLower === 'rejected' || statusLower === 'denied' ? 'text-gray-400' : 'text-blue-600'}`}>
                 <FileText className="w-6 h-6 mb-2" />
                 <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center">Submitted</span>
              </div>
              <div className={`h-1 w-12 sm:w-16 rounded-full mx-2 sm:mx-4 mb-5 ${statusLower === 'rejected' || statusLower === 'denied' ? 'bg-gray-200' : 'bg-blue-600'}`} />
              
              <div className={`flex flex-col items-center flex-1 justify-center ${statusLower === 'approved' || statusLower === 'closed' ? 'text-blue-600' : 'text-gray-400'}`}>
                 <Clock className="w-6 h-6 mb-2" />
                 <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center">Under Review</span>
              </div>
              <div className={`h-1 w-12 sm:w-16 rounded-full mx-2 sm:mx-4 mb-5 ${statusLower === 'approved' || statusLower === 'closed' ? 'bg-blue-600' : 'bg-gray-200'}`} />

              <div className={`flex flex-col items-center flex-1 justify-center ${(statusLower === 'approved' || statusLower === 'closed' || statusLower === 'rejected' || statusLower === 'denied') ? (statusLower === 'rejected' || statusLower === 'denied' ? 'text-red-500' : 'text-green-500') : 'text-gray-400'}`}>
                 <CheckCircle2 className="w-6 h-6 mb-2" />
                 <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center">
                    {(statusLower === 'rejected' || statusLower === 'denied') ? 'Denied' : 'Approved'}
                 </span>
              </div>
            </div>
          </section>

          {/* Incident Details section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Incident Details
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl p-6 border border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Policy Number</p>
                  <p className="text-base font-bold text-gray-900">{claim.PolicyNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Date of Loss</p>
                  <p className="text-base font-bold text-gray-900">{formatDate(claim.LossDate)}</p>
                </div>
                {claim.Location && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Location</p>
                    <p className="text-base font-medium text-gray-800">{claim.Location}</p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-base font-medium text-gray-800 bg-white p-4 rounded-lg border border-blue-50 whitespace-pre-wrap">
                    {claim.DescriptionOfLoss || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Financials Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Financial Assessment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Paid Loss amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(claim.PaidLoss || 0)}</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
