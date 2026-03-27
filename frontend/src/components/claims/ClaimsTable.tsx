import React from 'react';
import { Search } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Claim } from '@/types';

export default function ClaimsTable({ claims = [] }: { claims?: Claim[] }) {

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active' || s === 'open') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-700 text-white">Active</span>;
    } else if (s.includes('pending')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">Pending</span>;
    } else if (s === 'rejected') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">Rejected</span>;
    } else if (s === 'approved' || s === 'closed') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">Approved</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900">All Claims</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search claims..." 
            className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 transition-all text-gray-700"
          />
        </div>
      </div>
      <div className="overflow-y-auto overflow-x-hidden max-h-[400px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8fafc] text-gray-500 font-bold border-b border-gray-200 text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-5 py-4">Claim ID</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date Filed</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {claims.map((claim) => (
              <tr key={claim.ClaimNumber} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">{claim.ClaimNumber}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{claim.DescriptionOfLoss || claim.AccidentCode}</td>
                <td className="px-6 py-4 text-gray-600">{formatCurrency(claim.PaidLoss || 0)}</td>
                <td className="px-6 py-4 text-gray-500">{formatDate(claim.LossDate)}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(claim.Status || 'Unknown')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No claims found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
