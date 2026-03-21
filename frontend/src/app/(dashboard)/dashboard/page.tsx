'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPoliciesByEmail, getClaimsByPolicyNumbers, getBillingByPolicyNumbers } from '@/lib/api';
import { PendingClaimsCard } from '@/components/dashboard/PendingClaimsCard';
import { UpcomingPaymentsCard } from '@/components/dashboard/UpcomingPaymentsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import type { Policy, Claim, Billing } from '@/types';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let cancelled = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const p = await getPoliciesByEmail(user.email, signal);
        if (cancelled) return;

        setPolicies(p);
        const policyNumbers = p.map((x) => x.policyNumber).filter(Boolean);

        if (policyNumbers.length === 0) {
          setClaims([]);
          setBilling([]);
          return;
        }

        const [c, b] = await Promise.all([
          getClaimsByPolicyNumbers(policyNumbers, signal),
          getBillingByPolicyNumbers(policyNumbers, signal),
        ]);

        if (cancelled) return;

        setClaims(c);
        setBilling(b);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user?.email]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          {getGreeting()},{' '}
          <span className="text-orange-600">{user?.firstName} {user?.lastName}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Here&apos;s a quick overview of your insurance dashboard.
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PendingClaimsCard claims={claims} isLoading={isLoading} error={error} />
          <UpcomingPaymentsCard billing={billing} isLoading={isLoading} error={error} />
        </div>
      </section>

      <section>
        <QuickActions />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900">Your Overview</h2>
        </div>
        <OverviewCards policies={policies} claims={claims} billing={billing} isLoading={isLoading} error={error} />
      </section>
    </div>
  );
}
