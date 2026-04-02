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
  return <div className="p-6"><p className="text-slate-600">Policy page</p></div>;
}
