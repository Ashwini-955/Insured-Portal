'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPoliciesByEmail, createClaim, getClaimsByPolicyNumbers, getBillingByPolicyNumbers } from '@/lib/api';
import type { Policy, Claim, Billing } from '@/types';
import { ChevronLeft, FileText, Clock, CheckCircle2 } from 'lucide-react';

export default function NewClaimWizard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    policyNumber: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (!user?.email) return;
    
    // Load policies to populate dropdown
    const loadPolicies = async () => {
      try {
        setIsLoading(true);
        const p = await getPoliciesByEmail(user.email);
        setPolicies(p);
        
        // Also fetch claims and billing as requested
        const policyNumbers = p.map(x => x.policyNumber).filter(Boolean);
        if (policyNumbers.length > 0) {
          const [c, b] = await Promise.all([
            getClaimsByPolicyNumbers(policyNumbers),
            getBillingByPolicyNumbers(policyNumbers)
          ]);
          setClaims(c);
          setBilling(b);
        }

        // Auto-select if only 1 active policy
        const active = p.filter((x) => (x.status || '').toLowerCase() === 'active');
        if (active.length === 1) {
          setFormData(prev => ({ ...prev, policyNumber: active[0].policyNumber }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPolicies();
  }, [user?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    return !!(formData.policyNumber && formData.incidentDate && formData.description);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) {
        setError('Please fill in required fields: Policy ID, Date, and Description.');
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    } else {
      router.push('/claims');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createClaim({
        policyNumber: formData.policyNumber,
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        location: formData.location,
        description: formData.description
      });
      // Skip to a success step or redirect out
      router.push('/claims');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">File New Claim</h1>
        <p className="text-gray-500 mt-1">Follow the steps below to submit your insurance claim.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Progress Bar */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-slate-50/50">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
          <p className="text-sm font-medium text-gray-500 mt-3 text-right">
            {step} of 2 steps completed
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8 flex-1">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">1. Incident Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Policy ID</label>
                  <select
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900"
                    disabled={isLoading}
                  >
                    <option value="" disabled>Select Policy...</option>
                    {policies.map(p => (
                      <option key={p.policyNumber} value={p.policyNumber}>
                        {p.policyNumber} ({p.policyType || 'Policy'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Date of Incident</label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Time of Incident</label>
                  <input
                    type="time"
                    name="incidentTime"
                    value={formData.incidentTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Main Street, City"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-bold text-gray-700">Description of Incident</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the incident"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 py-6">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Review & Submit</h2>
               <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div><span className="text-gray-500">Policy ID:</span> <span className="font-semibold text-gray-900">{formData.policyNumber}</span></div>
                   <div><span className="text-gray-500">Date:</span> <span className="font-semibold text-gray-900">{formData.incidentDate}</span></div>
                   <div><span className="text-gray-500">Location:</span> <span className="font-semibold text-gray-900">{formData.location || 'N/A'}</span></div>
                   <div className="col-span-2"><span className="text-gray-500">Description:</span> <p className="font-semibold text-gray-900 mt-1 whitespace-pre-wrap">{formData.description}</p></div>
                 </div>
               </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          {step < 2 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
            >
              Next
            </button>
          ) : (
             <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70 flex items-center"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          )}
        </div>

      </div>

      {/* Footer Timeline Graphic */}
      <div className="mt-8 flex items-center justify-center max-w-2xl mx-auto">
        <div className="flex items-center space-x-2 text-blue-600 flex-1 justify-center">
          <div className="flex flex-col items-center">
             <FileText className="w-6 h-6 mb-2" />
             <span className="text-xs font-bold uppercase tracking-wider">Submitted</span>
          </div>
          <div className="h-1 w-16 bg-blue-600 rounded-full mx-4 mb-5" />
        </div>
        
        <div className="flex items-center space-x-2 text-gray-400 flex-1 justify-center">
          <div className="flex flex-col items-center">
             <Clock className="w-6 h-6 mb-2" />
             <span className="text-xs font-bold uppercase tracking-wider">Under Review</span>
          </div>
          <div className="h-1 w-16 bg-gray-200 rounded-full mx-4 mb-5" />
        </div>

        <div className="flex items-center space-x-2 text-gray-400 flex-1 justify-center">
          <div className="flex flex-col items-center">
             <CheckCircle2 className="w-6 h-6 mb-2" />
             <span className="text-xs font-bold uppercase tracking-wider">Approved/Denied</span>
          </div>
        </div>
      </div>

    </div>
  );
}
