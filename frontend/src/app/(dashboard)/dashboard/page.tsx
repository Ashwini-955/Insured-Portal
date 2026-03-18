'use client';

import { useAuth } from '@/context/AuthContext';
import { PendingClaimsCard } from '@/components/dashboard/PendingClaimsCard';
import { UpcomingPaymentsCard } from '@/components/dashboard/UpcomingPaymentsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { OverviewCards } from '@/components/dashboard/OverviewCards';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();

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
          <PendingClaimsCard />
          <UpcomingPaymentsCard />
        </div>
      </section>

      <section>
        <QuickActions />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900">Your Overview</h2>
        </div>
        <OverviewCards />
      </section>
    </div>
  );
}
