'use client';

import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/policies"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <span aria-hidden>📄</span>
          <span>View Policies</span>
        </Link>
        <Link
          href="/claims"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <span aria-hidden>🔧</span>
          <span>File a Claim</span>
        </Link>
        <Link
          href="/billing"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <span aria-hidden>💵</span>
          <span>Make a Payment</span>
        </Link>
      </div>
    </div>
  );
}
