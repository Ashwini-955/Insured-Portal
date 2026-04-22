'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Billing } from '@/types';

interface BillingChartsProps {
  billing: Billing | null;
}

const COLORS: Record<string, string> = {
  paid: '#10b981', // green-500
  due: '#f97316', // orange-500
  future: '#64748b' // slate-500
};

export default function BillingCharts({ billing }: BillingChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { pieData, barData } = useMemo(() => {
    if (!billing || !billing.projectedStatements) return { pieData: [], barData: [] };

    // Process Pie Data
    const statusMap: Record<string, number> = {};
    billing.projectedStatements.forEach(inv => {
      const status = (inv.status || 'unknown').toLowerCase();
      const amount = inv.statementTotalAmountDue || 0;
      statusMap[status] = (statusMap[status] || 0) + amount;
    });

    const pieResult = Object.keys(statusMap).map(key => ({
      name: key,
      value: statusMap[key]
    }));

    // Process Bar Data
    const barResult = billing.projectedStatements.map(inv => {
      let shortDate = 'N/A';
      try {
        if (inv.statementDueDate) {
          shortDate = new Date(inv.statementDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } catch (e) {
        // use fallback if invalid
      }
      
      const fullDate = inv.statementDueDate ? formatDate(inv.statementDueDate) : 'N/A';
      const status = (inv.status || 'future').toLowerCase();

      return {
        name: shortDate,
        amount: inv.statementTotalAmountDue || 0,
        fullDate: fullDate,
        status: status
      };
    });

    return { pieData: pieResult, barData: barResult };
  }, [billing]);

  // Avoid hydration mismatch for recharts
  if (!mounted || !pieData.length) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-gray-800 capitalize">{payload[0].name}</p>
          <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-gray-800">{payload[0].payload.fullDate}</p>
          <p className="text-gray-600">Amount: <span className="font-semibold text-gray-900">{formatCurrency(payload[0].value)}</span></p>
          <p className="text-xs text-gray-500 mt-1 capitalize">Status: {payload[0].payload.status}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Donut Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status Overview</h3>
        <div className="h-[250px] w-full flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#cbd5e1'} />
                ))}
              </Pie>
              <PieTooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          {pieData.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[entry.name] || '#cbd5e1' }} />
              <span className="capitalize">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Schedule</h3>
        <div className="h-[250px] w-full flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <BarTooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-6 opacity-0 pointer-events-none">
          {/* Spacer to align with Donut chart's legend vertically */}
          <div className="text-sm pb-1">&nbsp;</div>
        </div>
      </div>
    </div>
  );
}
