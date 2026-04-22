'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Billing } from '@/types';

export function UpcomingPaymentsCard({
  billing = [],
  isLoading,
  error,
}: {
  billing?: Billing[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const list = useMemo(() => {
    const items: { id: string; due: string; amount: number; status: string }[] = [];
    (billing ?? []).forEach((b) => {
      if (b.currentAmountDue != null && b.currentDueDate) {
        items.push({ id: b.PolicyNumber, due: b.currentDueDate, amount: b.currentAmountDue, status: 'Due' });
      }
      b.projectedStatements?.forEach((s) => {
        if (['Due', 'Overdue', 'Future'].includes(s.status)) {
          items.push({ id: b.PolicyNumber, due: s.statementDueDate, amount: s.statementTotalAmountDue ?? 0, status: s.status });
        }
      });
    });
    return items.slice(0, 4);
  }, [billing]);
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 sm:p-5 min-h-[220px] flex flex-col">
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
        <ul className="space-y-4 mt-2">
          {list.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-medium text-slate-900 truncate">{item.id}</p>
                <p className="text-xs text-slate-500 mt-1">Due: {item.due}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-base font-medium text-slate-900">{formatCurrency(item.amount)}</p>
                <span
                  className={
                    item.status === 'Overdue'
                      ? 'inline-flex mt-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200 uppercase tracking-wider font-medium'
                      : 'inline-flex mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wider font-medium'
                  }
                >
                  {item.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/billing" className="text-slate-900 hover:text-slate-600 transition-colors text-sm mt-auto pt-4 inline-flex items-center gap-1 font-medium">
        View All Payments <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
