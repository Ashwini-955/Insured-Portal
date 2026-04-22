"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText, X, AlertCircle } from 'lucide-react';

function SupportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const disputeInvoiceId = searchParams.get('disputeInvoiceId');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [description, setDescription] = useState('');
  
  const [tickets, setTickets] = useState([
    { 
      id: 'HELP-100', 
      type: 'General', 
      title: 'How to update address', 
      status: 'Resolved', 
      date: '2026-03-15', 
      description: 'Need help updating my billing address.' 
    }
  ]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (disputeInvoiceId) {
      setInvoiceId(disputeInvoiceId);
      setIsModalOpen(true);
      // Clean up the URL to prevent reopening on refresh
      router.replace('/support');
    }
  }, [disputeInvoiceId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newTicket = {
      id: `DISP-${Math.floor(Math.random() * 10000)}`,
      type: invoiceId ? 'Dispute' : 'General',
      title: invoiceId ? `Invoice Dispute: ${invoiceId}` : 'Support Request',
      status: 'Active',
      date: new Date().toISOString().split('T')[0],
      description
    };
    
    setTickets([newTicket, ...tickets]);
    setIsModalOpen(false);
    setDescription('');
    setShowToast(true);
    
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
        <p className="text-gray-600">Manage your past and active support requests.</p>
      </div>

      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 transition-all duration-300">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold">Request submitted successfully!</span>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Help Requests</h2>
          <button 
             onClick={() => { setInvoiceId(''); setDescription(''); setIsModalOpen(true); }}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            New Request
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {tickets.map((ticket, i) => (
            <div key={i} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{ticket.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 text-xs font-medium text-gray-500">
                      <span className="font-bold">ID: {ticket.id}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{ticket.date}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Type: {ticket.type}</span>
                    </div>
                  </div>
                </div>
                <div className="sm:text-right mt-2 sm:mt-0 ml-14 sm:ml-0">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ticket.status === 'Active' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {invoiceId ? 'Raise Invoice Dispute' : 'New Support Request'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {invoiceId && (
                <div className="mb-4 bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium">
                    You are raising a dispute for Invoice: <span className="font-bold">{invoiceId}</span>
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 caret-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm font-medium"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold">Loading Support Center...</div>}>
      <SupportContent />
    </Suspense>
  );
}
