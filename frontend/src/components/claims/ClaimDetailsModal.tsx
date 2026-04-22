'use client';

import { useState } from 'react';
import { Claim } from '@/types';
import { X, FileText, Calendar, MapPin, Clock, CheckCircle2, ShieldAlert, User, Phone, Mail, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';

interface ClaimDetailsModalProps {
  readonly claim: Claim | null;
  readonly onClose: () => void;
}

export function ClaimDetailsModal({ claim, onClose }: ClaimDetailsModalProps) {
  const [viewingImages, setViewingImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
              {claim.CarrierName && (
                <p className="text-sm font-semibold text-blue-600 mt-2 flex items-center gap-1">
                  <ShieldAlert size={14} />
                  {claim.CarrierName}
                </p>
              )}
            </div>
            <span className={`self-start flex-shrink-0 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap ${statusColors.bg} ${statusColors.text}`}>
              <span className={`inline-block w-3 h-3 ${statusColors.dot} rounded-full mr-2`}></span>
              {claim.Status || 'Unknown'}
            </span>
          </div>

          {/* Enhanced Claim Tracking Timeline */}
          <section className="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Live Tracking Status
            </h3>
            <div className="relative border-l-2 border-gray-200 ml-4 md:ml-6 mt-4 space-y-8">
              {[
                {
                  key: 'submitted',
                  title: 'Claim Submitted',
                  icon: FileText,
                  completed: true,
                  date: claim.ReceivedDate || claim.LossDate,
                  description: 'We have received your claim details.'
                },
                {
                  key: 'adjuster',
                  title: 'Adjuster Assigned',
                  icon: User,
                  completed: !!claim.MainAdjusterName,
                  date: claim.MainAdjusterName ? 'Assigned' : 'Pending',
                  description: claim.MainAdjusterName ? `Assigned to ${claim.MainAdjusterName}` : 'Waiting for assignment.'
                },
                {
                  key: 'review',
                  title: 'Under Review',
                  icon: Clock,
                  completed: ['active', 'approved', 'closed'].includes(statusLower) || !!claim.MainAdjusterName,
                  date: '',
                  description: 'Adjuster is reviewing the damage and evidence.'
                },
                {
                  key: 'estimate',
                  title: 'Estimate Prepared',
                  icon: ShieldAlert,
                  completed: Boolean(claim.ReserveDetails && claim.ReserveDetails.length > 0) || ['approved', 'closed'].includes(statusLower),
                  date: '',
                  description: 'Repair estimate and reserve limits calculated.'
                },
                {
                  key: 'resolved',
                  title: statusLower === 'rejected' || statusLower === 'denied' ? 'Claim Denied' : (claim.PaidLoss ? 'Payment Issued' : 'Resolution'),
                  icon: statusLower === 'rejected' || statusLower === 'denied' ? X : CheckCircle2,
                  completed: ['approved', 'closed', 'rejected', 'denied'].includes(statusLower),
                  date: '',
                  description: statusLower === 'rejected' || statusLower === 'denied' ? 'Coverage was unfortunately denied.' : (claim.PaidLoss ? 'Funds have been delivered for repairs.' : 'Awaiting final coverage decision.')
                }
              ].map((stage, i, arr) => {
                const isLast = i === arr.length - 1;
                const isStatusRejected = statusLower === 'rejected' || statusLower === 'denied';
                const nodeColor = stage.completed 
                                   ? (isLast && isStatusRejected ? 'bg-red-500' : 'bg-blue-600') 
                                   : 'bg-gray-200';
                
                return (
                  <div key={stage.key} className="relative pl-8 md:pl-10">
                    {/* Node */}
                    <span className={`absolute -left-[17px] top-0 flex items-center justify-center w-8 h-8 rounded-full border-4 border-gray-50 ${nodeColor} shadow-sm z-10 transition-colors duration-500`}>
                       <stage.icon className={`w-3.5 h-3.5 ${stage.completed ? 'text-white' : 'text-gray-400'}`} />
                    </span>
                    {/* Content */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start -mt-1">
                       <div>
                          <h4 className={`text-base font-bold ${stage.completed ? (isLast && isStatusRejected ? 'text-red-700' : 'text-gray-900') : 'text-gray-400'}`}>
                            {stage.title}
                          </h4>
                          <p className={`text-sm mt-1 max-w-sm ${stage.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                            {stage.description}
                          </p>
                       </div>
                       {stage.date && (
                          <span className={`text-xs font-semibold mt-2 sm:mt-0 sm:ml-4 whitespace-nowrap bg-white px-2.5 py-1 rounded-md border ${stage.completed ? 'border-gray-200 text-gray-600' : 'border-gray-100 text-gray-400'}`}>
                             {stage.date.includes('-') ? formatDate(stage.date) : stage.date}
                          </span>
                       )}
                    </div>
                  </div>
                );
              })}
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
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Accident Type</p>
                  <p className="text-base font-bold text-gray-900">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md text-sm">{claim.AccidentCode || 'Unknown'}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Date of Loss</p>
                  <p className="text-base font-bold text-gray-900">{formatDate(claim.LossDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Date Filed</p>
                  <p className="text-base font-bold text-gray-900">{formatDate(claim.ReceivedDate || claim.LossDate)}</p>
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
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Paid Loss Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(claim.PaidLoss || 0)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Estimated Reserve</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(claim.ReserveDetails?.[0]?.LossRes || claim.PaidLoss || 0)}</p>
              </div>
            </div>
          </section>

          {/* Additional Details Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Claims Adjuster Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Assigned Adjuster
              </h3>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <p className="text-lg font-bold text-gray-900 mb-4">{claim.MainAdjusterName || 'Not Assigned Yet'}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{claim.Email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-blue-600" />
                Evidence
              </h3>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-[148px] flex flex-col justify-center items-center text-center">
                {claim.Images && claim.Images.length > 0 ? (
                  <>
                    <div className="flex -space-x-2 mb-2">
                      {claim.Images.slice(0, 2).map((img, idx) => (
                        <div key={idx} className="w-10 h-10 rounded bg-gray-50 border border-white flex items-center justify-center shadow-sm overflow-hidden">
                          <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {claim.Images.length > 2 && (
                        <div className="w-10 h-10 rounded bg-blue-50 border border-white flex items-center justify-center shadow-sm text-xs font-bold text-blue-600">
                          +{claim.Images.length - 2}
                        </div>
                      )}
                    </div>
                    <p 
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-all"
                      onClick={() => setViewingImages(true)}
                    >
                      View {claim.Images.length} Attachment{claim.Images.length !== 1 ? 's' : ''}
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No evidence provided.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Lightbox / Gallery */}
      {viewingImages && claim.Images && claim.Images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4 flex-col">
          <div className="absolute top-4 right-4 flex gap-4">
            <button
              onClick={() => setViewingImages(false)}
              className="text-white hover:text-gray-300 bg-gray-800 bg-opacity-50 hover:bg-opacity-100 rounded-full p-2 transition-all p-2"
              title="Close"
            >
              <X size={28} />
            </button>
          </div>
          
          <div className="relative max-w-4xl w-full h-[70vh] flex items-center justify-center">
            {claim.Images.length > 1 && (
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : claim.Images!.length - 1))}
                className="absolute left-0 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-80 z-10 hidden md:block"
              >
                <div style={{ padding: '0 8px', fontSize: '24px' }}>&larr;</div>
              </button>
            )}
            
            <img 
              src={claim.Images[currentImageIndex]} 
              alt={`Evidence ${currentImageIndex + 1}`} 
              className="max-w-full max-h-full object-contain rounded-md"
            />
            
            {claim.Images.length > 1 && (
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev < claim.Images!.length - 1 ? prev + 1 : 0))}
                className="absolute right-0 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-80 z-10 hidden md:block"
              >
                <div style={{ padding: '0 8px', fontSize: '24px' }}>&rarr;</div>
              </button>
            )}
          </div>
          
          <div className="mt-4 text-white text-sm font-medium bg-gray-800 bg-opacity-50 px-4 py-1.5 rounded-full">
            {currentImageIndex + 1} / {claim.Images.length}
          </div>
          
          {claim.Images.length > 1 && (
            <div className="flex gap-2 mt-6 overflow-x-auto max-w-2xl px-4 pb-2 scrollbar-hide py-2">
               {claim.Images.map((img, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => setCurrentImageIndex(idx)}
                   className={`w-16 h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 flex items-center justify-center ${currentImageIndex === idx ? 'border-blue-500' : 'border-transparent opacity-50 hover:opacity-100'}`}
                 >
                   <img src={img} alt={`Thumb ${idx+1}`} className="w-full h-full object-cover" />
                 </div>
               ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
