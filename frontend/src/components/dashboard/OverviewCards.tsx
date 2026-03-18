'use client';

import Link from 'next/link';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Policy, Claim, Billing } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getBillingByEmail, getClaimsByEmail, getPoliciesByEmail } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

export function OverviewCards({
  policies,
  claims,
  billing,
}: {
  policies?: Policy[];
  claims?: Claim[];
  billing?: Billing[];
}) {
  const { user } = useAuth();
  const [pData, setPData] = useState<Policy[] | null>(policies ?? null);
  const [cData, setCData] = useState<Claim[] | null>(claims ?? null);
  const [bData, setBData] = useState<Billing[] | null>(billing ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!(policies && claims && billing));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (policies && claims && billing) return;
    if (!user?.email) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      policies ? Promise.resolve(policies) : getPoliciesByEmail(user.email),
      claims ? Promise.resolve(claims) : getClaimsByEmail(user.email),
      billing ? Promise.resolve(billing) : getBillingByEmail(user.email),
    ])
      .then(([pp, cc, bb]) => {
        if (cancelled) return;
        setPData(pp);
        setCData(cc);
        setBData(bb);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load overview');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [policies, claims, billing, user?.email]);

  const active = useMemo(
    () => (pData ?? []).filter((p) => (p.status ?? '').toLowerCase() === 'active'),
    [pData]
  );
  const open = useMemo(
    () => (cData ?? []).filter((c) => !['Approved', 'Rejected', 'Closed'].includes(c.status ?? '')),
    [cData]
  );
  const totalDue = useMemo(
    () => (bData ?? []).reduce((s, b) => s + (b.currentAmountDue ?? 0), 0),
    [bData]
  );
  const nextRenewal = useMemo(
    () => active.map((p) => p.expirationDate).filter(Boolean).sort()[0],
    [active]
  );
  const nextPayment = useMemo(
    () => (bData ?? []).flatMap((b) => b.projectedStatements ?? []).map((s) => s.dueDate).filter(Boolean).sort()[0],
    [bData]
  );
  const lastClaim = useMemo(
    () => (cData ?? []).map((c) => c.filedDate).filter(Boolean).sort().reverse()[0],
    [cData]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold">📄 Policies Overview</h3>
        {isLoading ? (
          <p className="text-slate-500 text-sm mt-2">Loading…</p>
        ) : error ? (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        ) : (
          <>
            <p className="text-2xl font-bold mt-2">{active.length} Active Policies</p>
            <p className="text-sm text-slate-500">Next renewal: {formatDate(nextRenewal)}</p>
          </>
        )}
        <Link href="/policies" className="text-blue-600 text-sm mt-2 inline-block">View All Policies →</Link>
      </div>
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold">🔧 Claims Status</h3>
        {isLoading ? (
          <p className="text-slate-500 text-sm mt-2">Loading…</p>
        ) : error ? (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        ) : (
          <>
            <p className="text-2xl font-bold mt-2">{open.length} Open Claim(s)</p>
            <p className="text-sm text-slate-500">Last update: {formatDate(lastClaim)}</p>
          </>
        )}
        <Link href="/claims" className="text-blue-600 text-sm mt-2 inline-block">Track Claims →</Link>
      </div>
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold">💰 Billing Summary</h3>
        {isLoading ? (
          <p className="text-slate-500 text-sm mt-2">Loading…</p>
        ) : error ? (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        ) : (
          <>
            <p className="text-2xl font-bold mt-2">{formatCurrency(totalDue)} Due</p>
            <p className="text-sm text-slate-500">Next payment: {formatDate(nextPayment)}</p>
          </>
        )}
        <Link href="/billing" className="text-blue-600 text-sm mt-2 inline-block">Make a Payment →</Link>
      </div>
    </div>
  );
}
