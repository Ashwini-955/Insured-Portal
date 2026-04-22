import React from 'react';
import { Home, Car, Building2, Shield } from 'lucide-react';
import type { Policy } from '@/types';

export default function PolicySelector({ 
  policies = [],
  selectedPolicyId,
  onSelectPolicy
}: { 
  policies?: Policy[];
  selectedPolicyId?: string | null;
  onSelectPolicy?: (id: string | null) => void;
}) {
  // Map policy data to UI format
  const mappedPolicies = policies.map((p) => {
    // Guess icon based on description
    const type = (p.policyType || '').toLowerCase();
    let icon = Shield;
    if (type.includes('home') || type.includes('property')) icon = Home;
    else if (type.includes('auto') || type.includes('vehicle')) icon = Car;
    else if (type.includes('commercial') || type.includes('business') || type.includes('farm')) icon = Building2;

    const isActive = (p.status || '').toLowerCase() === 'active';

    return {
      id: p.policyNumber,
      type: p.policyType || 'Insurance Policy',
      status: p.status || 'Unknown',
      icon,
      active: isActive
    };
  });

  if (mappedPolicies.length === 0) return null;

  const getPolicyStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-700 text-white shadow-sm">Active</span>;
    } else if (s.includes('pending')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-sm">Pending</span>;
    } else if (s.includes('cancel')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">Cancelled</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 shadow-sm">{status}</span>;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Select Your Policy</h2>
      {/* Mobile: Horizontal scrolling cards */}
      <div className="block md:hidden">
        <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
          {mappedPolicies.map((policy) => {
            const isSelected = selectedPolicyId === policy.id;
            
            return (
              <div 
                key={policy.id} 
                onClick={() => onSelectPolicy?.(isSelected ? null : policy.id)}
                className={`bg-white rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md flex-shrink-0 w-48 ${
                  isSelected 
                    ? 'border-blue-600 shadow-md ring-2 ring-blue-600 bg-blue-50/10' 
                    : policy.active 
                      ? 'border-blue-300 shadow-sm hover:border-blue-400' 
                      : 'border-gray-200 shadow-sm hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-2 mb-3">
                    <div className={`p-1.5 rounded-full border shadow-sm ${isSelected ? 'border-blue-200 bg-blue-100' : 'border-gray-100 bg-gray-50'}`}>
                      <policy.icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="mt-0.5">
                      <h3 className="font-bold text-gray-900 text-xs line-clamp-1" title={policy.type}>{policy.type}</h3>
                      <p className="text-xs text-gray-500 font-medium">{policy.id}</p>
                    </div>
                  </div>
                  {!policy.active && (
                    <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ml-2">
                      Expired
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-50/50">
                  <span className="text-xs font-semibold text-gray-500">Status:</span>
                  {getPolicyStatusBadge(policy.status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Desktop: Grid layout */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        {mappedPolicies.map((policy) => {
          const isSelected = selectedPolicyId === policy.id;
          
          return (
            <div 
              key={policy.id} 
              onClick={() => onSelectPolicy?.(isSelected ? null : policy.id)}
              className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-blue-600 shadow-md ring-2 ring-blue-600 bg-blue-50/10' 
                  : policy.active 
                    ? 'border-blue-300 shadow-sm hover:border-blue-400' 
                    : 'border-gray-200 shadow-sm hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3 mb-6">
                  <div className={`p-2 rounded-full border shadow-sm ${isSelected ? 'border-blue-200 bg-blue-100' : 'border-gray-100 bg-gray-50'}`}>
                    <policy.icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="mt-1">
                    <h3 className="font-bold text-gray-900 text-base line-clamp-1" title={policy.type}>{policy.type}</h3>
                    <p className="text-xs text-gray-500 font-medium">{policy.id}</p>
                  </div>
                </div>
                {!policy.active && (
                  <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ml-3">
                    Expired
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50/50">
                <span className="text-xs font-semibold text-gray-500">Status:</span>
                {getPolicyStatusBadge(policy.status)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
