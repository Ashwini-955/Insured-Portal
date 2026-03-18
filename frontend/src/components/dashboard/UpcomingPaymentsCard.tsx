'use client';

import Link from 'next/link';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Billing } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getBillingByEmail } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

export function UpcomingPaymentsCard({ billing }: { billing?: Billing[] }) {
  const { user } = useAuth();
  const [data, setData] = useState<Billing[] | null>(billing ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!billing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (billing) return;
    if (!user?.email) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getBillingByEmail(user.email)
      .then((rows) => { if (!cancelled) setData(rows); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load billing'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [billing, user?.email]);

  const list = useMemo(() => {
    const items: { id: string; due: string; amount: number; status: string }[] = [];
    (data ?? []).forEach((b) => {
    if (b.currentAmountDue != null && b.currentDueDate) {
      items.push({ id: b.billingId || b.policyNumber, due: b.currentDueDate, amount: b.currentAmountDue, status: 'Due' });
    }
    b.projectedStatements?.forEach((s) => {
      if (['Due', 'Overdue'].includes(s.status)) {
        items.push({ id: b.billingId || b.policyNumber, due: s.dueDate, amount: s.totalAmountDue ?? 0, status: s.status });
      }
    });
    });
    return items.slice(0, 5);
  }, [data]);
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 sm:p-5 min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Upcoming Payments</h3>
        <span className="text-orange-700 text-sm" aria-hidden>💰</span>
      </div>
      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading billing…</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : list.length === 0 ? (
        <p className="text-slate-500 text-sm">No upcoming payments</p>
      ) : (
        <ul className="space-y-3">
          {list.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">Invoice: {item.id}</p>
                <p className="text-xs text-slate-500 mt-0.5">Due: {item.due}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-medium text-slate-900">{formatCurrency(item.amount)}</p>
                <span
                  className={
                    item.status === 'Overdue'
                      ? 'inline-flex mt-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200'
                      : 'inline-flex mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200'
                  }
                >
                  {item.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/billing" className="text-blue-700 text-sm mt-4 inline-flex items-center gap-1 font-medium">
        View All Payments <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
