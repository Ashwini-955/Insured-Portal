'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Policy, Claim, Billing } from '@/types';

export function OverviewCards({
  policies = [],
  claims = [],
  billing = [],
  isLoading,
  error,
}: {
  policies?: Policy[];
  claims?: Claim[];
  billing?: Billing[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const active = useMemo(
    () => (policies ?? []).filter((p) => (p.status ?? '').toLowerCase() === 'active'),
    [policies]
  );
  const open = useMemo(
    () => (claims ?? []).filter((c) => !['Approved', 'Rejected', 'Closed'].includes(c.Status ?? '')),
    [claims]
  );
  const totalDue = useMemo(
    () => (billing ?? []).reduce((s, b) => s + (b.currentAmountDue ?? 0), 0),
    [billing]
  );
  const nextRenewal = useMemo(
    () => active.map((p) => p.expirationDate).filter(Boolean).sort()[0],
    [active]
  );
  const nextPayment = useMemo(
    () => (billing ?? []).flatMap((b) => b.projectedStatements ?? []).map((s) => s.statementDueDate).filter(Boolean).sort()[0],
    [billing]
  );
  const lastClaim = useMemo(
    () => (claims ?? []).map((c) => c.ReceivedDate).filter(Boolean).sort().reverse()[0],
    [claims]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-slate-900">📄 Policies Overview</h3>
        {isLoading ? (
          <p className="text-slate-500 text-sm mt-2">Loading…</p>
        ) : error ? (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        ) : (
          <>
            <p className="text-2xl font-bold text-slate-900 mt-2">{active.length} Active Policies</p>
            <p className="text-sm text-slate-500">Next renewal: {formatDate(nextRenewal)}</p>
          </>
        )}
        <Link href="/policies" className="text-blue-600 text-sm mt-2 inline-block">View All Policies →</Link>
      </div>
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-slate-900">🔧 Claims Status</h3>
        {isLoading ? (
          <p className="text-slate-500 text-sm mt-2">Loading…</p>
        ) : error ? (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        ) : (
          <>
            <p className="text-2xl font-bold text-slate-900 mt-2">{open.length} Open Claim(s)</p>
            <p className="text-sm text-slate-500">Last update: {formatDate(lastClaim)}</p>
          </>
        )}
        <Link href="/claims" className="text-blue-600 text-sm mt-2 inline-block">Track Claims →</Link>
      </div>
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-slate-900">💰 Billing Summary</h3>
        {isLoading ? (
          <p className="text-slate-500 text-sm mt-2">Loading…</p>
        ) : error ? (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        ) : (
          <>
            <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalDue)} Due</p>
            <p className="text-sm text-slate-500">Next payment: {formatDate(nextPayment)}</p>
          </>
        )}
        <Link href="/billing" className="text-blue-600 text-sm mt-2 inline-block">Make a Payment →</Link>
      </div>
    </div>
  );
}
