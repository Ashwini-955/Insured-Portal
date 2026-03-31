'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPoliciesByEmail } from '@/lib/api';
import { Policy } from '@/types';
import { PolicyCard } from '@/components/policies/PolicyCard';
import { PolicyDetailsModal } from '@/components/policies/PolicyDetailsModal';
import { Search } from 'lucide-react';

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
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your policies...</p>
        </div>
      </div>
    );
  }

  if (error && policies.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policies in Force: {policies.length}</h1>
          <p className="text-gray-600 mt-1">Your current coverage protects your home and assets.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search policies by number or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-8 mb-6 border-b border-gray-200">
        {[
          { tab: 'all' as FilterTab, label: 'All Policies', count: policies.length },
          { tab: 'active' as FilterTab, label: 'Active', count: activePolicies },
          { tab: 'expired' as FilterTab, label: 'Expired', count: expiredPolicies },
          { tab: 'upcoming' as FilterTab, label: 'Upcoming', count: upcomingPolicies },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`pb-3 font-medium text-sm transition-colors ${
              activeTab === item.tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {/* Policy Grid */}
      {filteredPolicies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No policies found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
