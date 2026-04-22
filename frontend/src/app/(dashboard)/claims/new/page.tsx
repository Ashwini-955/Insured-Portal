'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPoliciesByEmail, createClaimWithImages, getClaimsByPolicyNumbers, getBillingByPolicyNumbers } from '@/lib/api';
import type { Policy, Claim, Billing } from '@/types';
import { ChevronLeft, FileText, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { config } from '@/config/env';
import { addNotification } from '@/lib/notifications';

export default function NewClaimWizard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    policyNumber: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
    accidentCode: '',
    description: ''
  });
  
  const [images, setImages] = useState<File[]>([]);

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

  const handleNext = () => {
    if (step === 1) {
      if (images.length === 0 || !formData.policyNumber || !formData.incidentDate || !formData.accidentCode) {
        setError('Please select a policy, date, short title, and upload at least one image to proceed.');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      if (!formData.description) {
        setError('Please provide a description.');
        return;
      }
      setError(null);
      setStep(3);
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

  const handleGenerateAI = async () => {
    if (images.length === 0) {
      setError('Please upload an image first.');
      return;
    }
    
    try {
      setIsGeneratingAI(true);
      setError(null);
      
      const base64Images = await Promise.all(
        images.map(img => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(img);
        }))
      );

      const response = await fetch(`${config.api.baseUrl}/ai/analyze-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images })
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, description: data.description }));
      } else {
        throw new Error(data.message || 'Failed to generate description');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during AI generation.');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const fd = new FormData();
      fd.append('policyNumber', formData.policyNumber);
      fd.append('incidentDate', formData.incidentDate);
      fd.append('incidentTime', formData.incidentTime);
      fd.append('location', formData.location);
      fd.append('accidentCode', formData.accidentCode);
      fd.append('description', formData.description);
      
      // Append each selected image to the form data
      images.forEach(img => fd.append('images', img));
      
      const newClaim = await createClaimWithImages(fd);
      
      addNotification({
        type: 'claim',
        title: 'Claim Submitted',
        message: `Your claim <span class="font-bold text-gray-800">${newClaim.ClaimNumber}</span> for Policy <span class="font-bold text-gray-800">${formData.policyNumber}</span> has been submitted successfully and is now pending review.`,
        policyNumber: formData.policyNumber,
        claimNumber: newClaim.ClaimNumber,
      });

      setIsSuccess(true);
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

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Claim Submitted Successfully!</h2>
          <p className="text-gray-500 mb-8">Your claim has been securely transmitted to our processing center. We will notify you once review begins.</p>
          <button
            onClick={() => router.push('/claims')}
            className="w-full px-6 py-3.5 bg-[#1d4ed8] text-white font-semibold rounded-xl hover:bg-blue-800 transition shadow-sm"
          >
            Return to Claims Dashboard
          </button>
        </div>
      </div>
    );
  }

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
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <p className="text-sm font-medium text-gray-500 mt-3 text-right">
            {step} of 3 steps completed
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
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 py-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">1. Incident Details & Evidence</h2>

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
                    {policies.filter(p => (p.status || '').toLowerCase() === 'active').map(p => (
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
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Short Incident Title</label>
                  <input
                    type="text"
                    name="accidentCode"
                    value={formData.accidentCode}
                    onChange={handleChange}
                    placeholder="e.g., Roof Damage from Storm"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-4 pt-6 mt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Upload Images (Required)</h3>
                <p className="text-xs text-gray-500">Please attach at least one photo of the damage or scene. Max 5 images.</p>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition flex flex-col items-center justify-center cursor-pointer relative">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/jpeg,image/png,image/webp" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files) {
                        setImages(Array.from(e.target.files).slice(0, 5));
                      }
                    }}
                  />
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">Upload files</span> or drag and drop
                    </p>
                  </div>
                </div>
                
                {images.length > 0 && (
                  <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <li key={i} className="text-xs flex items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
                        <span className="truncate flex-1">{img.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 py-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">2. Description of Loss</h2>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-700">Description of Incident</label>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGeneratingAI ? 'Generating...' : 'Take Help of AI'}
                  </button>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the incident"
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 py-6">
               <h2 className="text-xl font-bold text-gray-900 mb-6">3. Review & Submit</h2>
               <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div><span className="text-gray-500">Policy ID:</span> <span className="font-semibold text-gray-900">{formData.policyNumber}</span></div>
                   <div><span className="text-gray-500">Date:</span> <span className="font-semibold text-gray-900">{formData.incidentDate}</span></div>
                   <div><span className="text-gray-500">Location:</span> <span className="font-semibold text-gray-900">{formData.location || 'N/A'}</span></div>
                   <div className="col-span-2"><span className="text-gray-500">Title:</span> <span className="font-semibold text-gray-900">{formData.accidentCode}</span></div>
                   <div className="col-span-2"><span className="text-gray-500">Description:</span> <p className="font-semibold text-gray-900 mt-1 whitespace-pre-wrap">{formData.description}</p></div>
                   <div className="col-span-2 mt-2 pt-4 border-t border-gray-200">
                     <span className="text-gray-500 block mb-2">Attached Images:</span>
                     <div className="flex flex-wrap gap-2">
                       {images.map((img, i) => (
                         <span key={i} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">{img.name}</span>
                       ))}
                     </div>
                   </div>
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

          {step < 3 ? (
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

    </div>
  );
}
