import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Claim } from '@/types';
import { ClaimDetailsModal } from './ClaimDetailsModal';

export default function ClaimsTable({ claims = [] }: { claims?: Claim[] }) {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortParam, setSortParam] = useState('');

  let filteredClaims = claims.filter((claim) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch = (
        (claim.ClaimNumber && claim.ClaimNumber.toLowerCase().includes(q)) ||
        (claim.DescriptionOfLoss && claim.DescriptionOfLoss.toLowerCase().includes(q)) ||
        (claim.AccidentCode && claim.AccidentCode.toLowerCase().includes(q)) ||
        (claim.Status && claim.Status.toLowerCase().includes(q))
      );
      if (!matchSearch) return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      const s = (claim.Status || '').toLowerCase();
      if (!s.includes(statusFilter)) return false;
    }

    return true;
  });

  // 3. Sort
  if (sortParam) {
    filteredClaims = [...filteredClaims].sort((a, b) => {
      if (sortParam.startsWith('date')) {
        const dateA = new Date(a.LossDate || a.ReceivedDate || 0).getTime();
        const dateB = new Date(b.LossDate || b.ReceivedDate || 0).getTime();
        return sortParam === 'date-asc' ? dateA - dateB : dateB - dateA;
      } else if (sortParam.startsWith('amount')) {
        const amtA = a.PaidLoss || 0;
        const amtB = b.PaidLoss || 0;
        return sortParam === 'amount-asc' ? amtA - amtB : amtB - amtA;
      }
      return 0;
    });
  }

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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 md:mb-8">
      <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <h2 className="text-base md:text-lg font-bold text-gray-900">All Claims</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 w-full sm:w-[130px]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
          </select>

          {/* Sort */}
          <select 
            value={sortParam} 
            onChange={(e) => setSortParam(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 w-full sm:w-[180px]"
          >
            <option value="">Sort By...</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search claims..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[200px] transition-all text-gray-700"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <table className="w-full text-left text-xs md:text-sm min-w-[600px] relative">
          <thead className="bg-[#f8fafc] text-gray-500 font-bold border-b border-gray-200 text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-4 md:px-5 py-3 md:py-4">Claim ID</th>
              <th className="px-4 md:px-6 py-3 md:py-4">Title</th>
              <th className="px-4 md:px-6 py-3 md:py-4">Amount</th>
              <th className="px-4 md:px-6 py-3 md:py-4">Date Filed</th>
              <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClaims.map((claim) => (
              <tr key={claim.ClaimNumber} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 md:px-5 py-3 md:py-4 font-bold text-gray-900 whitespace-nowrap">{claim.ClaimNumber}</td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-700 font-medium">{claim.DescriptionOfLoss || claim.AccidentCode}</td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600">{formatCurrency(claim.PaidLoss || 0)}</td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-500">{formatDate(claim.LossDate)}</td>
                <td className="px-4 md:px-6 py-3 md:py-4">
                  {getStatusBadge(claim.Status || 'Unknown')}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                  <button 
                    onClick={() => setSelectedClaim(claim)}
                    className="text-xs md:text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredClaims.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 md:px-6 py-6 md:py-8 text-center text-gray-500">
                  No claims found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedClaim && (
        <ClaimDetailsModal 
          claim={selectedClaim} 
          onClose={() => setSelectedClaim(null)} 
        />
      )}
    </div>
  );
}
