'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPoliciesByEmail, getBillingByPolicyNumbers } from '@/lib/api';
import type { Policy, Billing } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

import PolicySelector from '@/components/claims/PolicySelector';
import SelectedPolicySummary from '@/components/billing/SelectedPolicySummary';
import BillingDetailsCard from '@/components/billing/BillingDetailsCard';
import AutoPayCard from '@/components/billing/AutoPayCard';
import InvoiceHistoryTable from '@/components/billing/InvoiceHistoryTable';
import BillingCharts from '@/components/billing/BillingCharts';
import InvoiceDetailsModal from '@/components/billing/InvoiceDetailsModal';

export default function BillingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [billings, setBillings] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  
  // By default, we select the first policy (handled after fetch)
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  useEffect(() => {
    // Set selected policy from URL query parameter if provided
    const policyFromUrl = searchParams.get('policyId');
    if (policyFromUrl) {
      setSelectedPolicyId(policyFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user?.email) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const p = await getPoliciesByEmail(user.email, signal);
        if (cancelled) return;

        setPolicies(p);
        
        // Use all available policy numbers to fetch billing
        const policyNumbers = p.map((x) => x.policyNumber).filter(Boolean);

        if (policyNumbers.length === 0) {
          setBillings([]);
          return;
        }

        // If policyId from URL was provided, use it; otherwise default to first active or first policy
        const initialSelection = searchParams.get('policyId') 
                              || p.find(val => val.status?.toLowerCase() === 'active')?.policyNumber 
                              || (p.length > 0 ? p[0].policyNumber : null);
        
        if (initialSelection && !selectedPolicyId) {
          setSelectedPolicyId(initialSelection);
        }

        const b = await getBillingByPolicyNumbers(policyNumbers, signal);
        
        if (cancelled) return;
        setBillings(b);
        
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load billing data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadData();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user?.email, searchParams]);

  const selectedPolicy = useMemo(() => {
    return policies.find(p => p.policyNumber === selectedPolicyId) || null;
  }, [policies, selectedPolicyId]);

  const selectedBilling = useMemo(() => {
    return billings.find(b => b.PolicyNumber === selectedPolicyId) || null;
  }, [billings, selectedPolicyId]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="font-medium">Evaluating your account balance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold">Error</h2>
            <p className="font-medium mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Billing Details</h1>
        <p className="text-gray-500 mt-2 font-medium">Manage your payments, view invoices, and customize Auto-Pay.</p>
      </div>

      <PolicySelector 
        policies={policies}
        selectedPolicyId={selectedPolicyId}
        onSelectPolicy={(id) => id && setSelectedPolicyId(id)} // Prevent deselecting returning null, keeping one active
      />

      {selectedPolicyId ? (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <SelectedPolicySummary policy={selectedPolicy} user={user} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BillingDetailsCard billing={selectedBilling} />
            <AutoPayCard billing={selectedBilling} />
          </div>

<<<<<<< HEAD
          <BillingCharts billing={selectedBilling} />

          <InvoiceHistoryTable billing={selectedBilling} />
=======
          <InvoiceHistoryTable
            billing={selectedBilling}
            onView={(invoice) => {
              setSelectedInvoice(invoice);
              setOpenModal(true);
            }}
          />
>>>>>>> origin/Gouri
        </div>
      ) : (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-8 text-center mt-8">
           <p className="text-blue-700 font-bold">Please select a policy to view billing details.</p>
        </div>
      )}
      {openModal && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
}
