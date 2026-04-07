'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPoliciesByEmail } from '@/lib/api';
import { Policy } from '@/types';
import { PolicyCard } from '@/components/policies/PolicyCard';
import { PolicyDetailsModal } from '@/components/policies/PolicyDetailsModal';
import { Search, AlertCircle, ShieldCheck, FileClock, ShieldX } from 'lucide-react';

type FilterTab = 'all' | 'active' | 'expired' | 'upcoming';

export default function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // Fetch policies on mount
  useEffect(() => {
    const fetchPolicies = async () => {
      if (!user?.email) {
        setError('User email not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getPoliciesByEmail(user.email);
        setPolicies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load policies');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [user?.email]);

  // Filter and search policies
  useEffect(() => {
    let result = policies;

    // Filter by tab
    if (activeTab === 'active') {
      result = result.filter((p) => p.status?.toLowerCase() === 'active');
    } else if (activeTab === 'expired') {
      result = result.filter((p) => p.status?.toLowerCase() === 'expired');
    } else if (activeTab === 'upcoming') {
      const now = new Date();
      result = result.filter((p) => {
        const expDate = p.expirationDate ? new Date(p.expirationDate) : null;
        return expDate && expDate > now && p.status?.toLowerCase() !== 'active';
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.policyNumber?.toLowerCase().includes(term) ||
          p.propertyAddress?.addressLine1?.toLowerCase().includes(term) ||
          p.propertyAddress?.city?.toLowerCase().includes(term)
      );
    }

    setFilteredPolicies(result);
  }, [policies, searchTerm, activeTab]);

  // Count policies by status
  const activePolicies = policies.filter((p) => p.status?.toLowerCase() === 'active').length;
  const expiredPolicies = policies.filter((p) => p.status?.toLowerCase() === 'expired').length;
  const upcomingPolicies = policies.filter((p) => {
    const expDate = p.expirationDate ? new Date(p.expirationDate) : null;
    return expDate && expDate > new Date() && p.status?.toLowerCase() !== 'active';
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="font-medium">Loading your policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Policies Overview</h1>
        <p className="text-xs md:text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md w-fit">
          {policies.length} Total Policies
        </p>
      </div>

      {/* Status Overview Cards — Matching ClaimsOverviewCards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Active Policies */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" strokeWidth={2.5} />
              <h2 className="text-sm md:text-base font-bold text-gray-900">Active Policies</h2>
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 md:mb-2">{activePolicies}</p>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 leading-relaxed">Policies currently providing active coverage.</p>
        </div>

        {/* Pending/Upcoming */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
              <FileClock className="w-4 h-4 md:w-5 md:h-5 text-orange-500" strokeWidth={2.5} />
              <h2 className="text-sm md:text-base font-bold text-gray-900">Pending / Upcoming</h2>
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 md:mb-2">{upcomingPolicies}</p>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 leading-relaxed">Policies awaiting activation or renewal.</p>
        </div>

        {/* Expired/Cancelled */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
              <ShieldX className="w-4 h-4 md:w-5 md:h-5 text-red-500" strokeWidth={2.5} />
              <h2 className="text-sm md:text-base font-bold text-gray-900">Expired / Cancelled</h2>
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 md:mb-2">{expiredPolicies}</p>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 leading-relaxed">Policies that have expired or been cancelled.</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by policy number, address, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white font-medium placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Filter Tabs — Clean text with underline */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { tab: 'all' as FilterTab, label: 'All Policies', count: policies.length },
            { tab: 'active' as FilterTab, label: 'Active', count: activePolicies },
            { tab: 'expired' as FilterTab, label: 'Expired', count: expiredPolicies },
            { tab: 'upcoming' as FilterTab, label: 'Upcoming', count: upcomingPolicies },
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
                activeTab === item.tab
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {item.label}
              <span className={`ml-1.5 text-xs font-bold ${activeTab === item.tab ? 'text-blue-500' : 'text-gray-400'}`}>
                ({item.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Policy Grid */}
      {filteredPolicies.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <div className="inline-block p-3 rounded-full bg-gray-100">
              <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-gray-400" />
            </div>
          </div>
          <p className="text-base md:text-lg font-semibold text-gray-900 mb-1">No policies found</p>
          <p className="text-sm text-gray-500">{searchTerm ? 'Try adjusting your search criteria' : 'You don\'t have any policies yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy._id || policy.policyNumber}
              policy={policy}
              onViewDetails={(p) => setSelectedPolicy(p)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <PolicyDetailsModal policy={selectedPolicy} onClose={() => setSelectedPolicy(null)} />
    </div>
  );
}