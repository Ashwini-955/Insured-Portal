'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPoliciesByEmail } from '@/lib/api';
import { Policy } from '@/types';
import { PolicyCard } from '@/components/policies/PolicyCard';
import { PolicyDetailsModal } from '@/components/policies/PolicyDetailsModal';
import { Search, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Policies</h1>
            <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {policies.length} Total
            </p>
          </div>
          <p className="text-gray-600 text-lg">Manage and review all your insurance coverage</p>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Policies</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activePolicies}</p>
              </div>
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending/Upcoming</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingPolicies}</p>
              </div>
              <Clock size={32} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Expired/Cancelled</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{expiredPolicies}</p>
              </div>
              <XCircle size={32} className="text-red-500" />
            </div>
          </div>
          {error && (
            <div className="bg-red-50 rounded-xl p-5 border border-red-200 flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-4">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by policy number, address, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-500 shadow-sm"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-4 border-b border-gray-200 min-w-max md:min-w-0">
            {[
              { tab: 'all' as FilterTab, label: 'All Policies', count: policies.length, icon: '📋' },
              { tab: 'active' as FilterTab, label: 'Active', count: activePolicies, icon: '✅' },
              { tab: 'expired' as FilterTab, label: 'Expired', count: expiredPolicies, icon: '❌' },
              { tab: 'upcoming' as FilterTab, label: 'Upcoming', count: upcomingPolicies, icon: '⏰' },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`px-6 py-3 font-semibold text-sm transition-all whitespace-nowrap rounded-lg ${
                  activeTab === item.tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label} <span className="ml-2 font-bold text-gray-400">({item.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Policy Grid */}
        {filteredPolicies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="mb-4">
              <div className="inline-block p-3 rounded-full bg-gray-100">
                <AlertCircle size={32} className="text-gray-500" />
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">No policies found</p>
            <p className="text-gray-600">{searchTerm ? 'Try adjusting your search criteria' : 'You don\'t have any policies yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-max">
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
    </div>
  );
}
