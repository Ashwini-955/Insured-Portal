'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { formatDate } from '@/utils/formatDate';
import type { Claim } from '@/types';

const PENDING = ['Pending', 'Pending Review', 'Submitted', 'Open', 'Under Review'];

export function PendingClaimsCard({
  claims = [],
  isLoading,
  error,
}: {
  claims?: Claim[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const pending = useMemo(() => (claims ?? []).filter((c) => PENDING.includes(c.Status ?? '')), [claims]);
  return (
    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 sm:p-5 min-h-[220px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Pending Claims</h3>
        <span className="text-sky-700 text-sm" aria-hidden>⚠️</span>
      </div>
      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading claims…</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : pending.length === 0 ? (
        <p className="text-slate-500 text-sm">No pending claims</p>
      ) : (
        <ul className="space-y-4 mt-2">
          {pending.slice(0, 3).map((c) => (
            <li key={c.ClaimNumber} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{c.AccidentCode || c.ClaimNumber}</p>
                <p className="text-[11px] text-slate-500 mt-1">Filed: {formatDate(c.ReceivedDate)}</p>
              </div>
              <span className="shrink-0 text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider font-medium">
                {c.Status}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/claims" className="text-slate-900 hover:text-slate-600 transition-colors text-sm mt-auto pt-4 inline-flex items-center gap-1 font-medium">
        Review All Claims <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
