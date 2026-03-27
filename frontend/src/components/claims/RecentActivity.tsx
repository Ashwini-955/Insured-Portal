import React from 'react';
import { FileText, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import type { Claim } from '@/types';

export default function RecentActivity({ claims = [] }: { claims?: Claim[] }) {
  // Map claims to activity format. Sort by received date descending.
  const activities = [...claims]
    .sort((a, b) => new Date(b.ReceivedDate || 0).getTime() - new Date(a.ReceivedDate || 0).getTime())
    .slice(0, 4) // Show top 4
    .map((c, index) => {
      const isPending = (c.Status || '').toLowerCase().includes('pending');
      return {
        id: c.ClaimNumber,
        text: `Claim ${c.ClaimNumber} for ${c.AccidentCode || 'incident'} updated to "${c.Status}".`,
        date: formatDate(c.ReceivedDate),
        icon: isPending ? Calendar : FileText,
        iconColor: isPending ? 'text-orange-500' : 'text-blue-500'
      };
    });

  if (activities.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors cursor-default gap-2 sm:gap-0">
            <div className="flex items-center space-x-4">
              <activity.icon className={`w-5 h-5 ${activity.iconColor}`} strokeWidth={2} />
              <p className="text-sm text-gray-700 font-medium">{activity.text}</p>
            </div>
            <span className="text-xs text-gray-500 font-medium">{activity.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
