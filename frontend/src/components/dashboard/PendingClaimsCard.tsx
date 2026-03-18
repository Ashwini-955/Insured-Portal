'use client';

import Link from 'next/link';
import { formatDate } from '@/utils/formatDate';
import type { Claim } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getClaimsByEmail } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

const PENDING = ['Pending', 'Pending Review', 'Submitted', 'Open', 'Under Review'];

export function PendingClaimsCard({ claims }: { claims?: Claim[] }) {
  const { user } = useAuth();
  const [data, setData] = useState<Claim[] | null>(claims ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!claims);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (claims) return;
    if (!user?.email) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getClaimsByEmail(user.email)
      .then((rows) => { if (!cancelled) setData(rows); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load claims'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [claims, user?.email]);

  const pending = useMemo(() => (data ?? []).filter((c) => PENDING.includes(c.status ?? '')), [data]);
  return (
    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 sm:p-5 min-h-[220px]">
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
        <ul className="space-y-3">
          {pending.slice(0, 3).map((c) => (
            <li key={c.claimNumber} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{c.title || c.claimNumber}</p>
                <p className="text-xs text-slate-500 mt-0.5">Filed: {formatDate(c.filedDate)}</p>
              </div>
              <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {c.status}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/claims" className="text-blue-700 text-sm mt-4 inline-flex items-center gap-1 font-medium">
        Review All Claims <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
