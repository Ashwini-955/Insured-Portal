'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPoliciesByEmail, getClaimsByPolicyNumbers, getBillingByPolicyNumbers } from '@/lib/api';
import type { Policy, Claim, Billing } from '@/types';
import ClaimsOverviewCards from '@/components/claims/ClaimsOverviewCards';
import RecentActivity from '@/components/claims/RecentActivity';
import PolicySelector from '@/components/claims/PolicySelector';
import ClaimsTable from '@/components/claims/ClaimsTable';
import { Loader2 } from 'lucide-react';

export default function ClaimsPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let cancelled = false;

    const loadClaimsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const p = await getPoliciesByEmail(user.email, signal);
        if (cancelled) return;

        setPolicies(p);
        const policyNumbers = p.map((x) => x.policyNumber).filter(Boolean);

        if (policyNumbers.length === 0) {
          setClaims([]);
          return;
        }

        const [c, b] = await Promise.all([
          getClaimsByPolicyNumbers(policyNumbers, signal),
          getBillingByPolicyNumbers(policyNumbers, signal)
        ]);

        if (cancelled) return;

        setClaims(c);
        setBilling(b);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load claims data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadClaimsData();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user?.email]);

  const filteredClaims = useMemo(() => {
    if (!selectedPolicyId) return claims;
    return claims.filter((c) => c.PolicyNumber === selectedPolicyId);
  }, [claims, selectedPolicyId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="font-medium">Loading your claims...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold">Error</h2>
          <p className="font-medium mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Claims Overview</h1>
        {selectedPolicyId && (
          <button 
            onClick={() => setSelectedPolicyId(null)}
            className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors w-fit"
          >
            Clear Filter
          </button>
        )}
      </div>
      <ClaimsOverviewCards claims={claims} />
      <RecentActivity claims={claims} />
      <PolicySelector 
        policies={policies} 
        selectedPolicyId={selectedPolicyId}
        onSelectPolicy={setSelectedPolicyId}
      />
      <ClaimsTable claims={filteredClaims} />
    </div>
  );
}
