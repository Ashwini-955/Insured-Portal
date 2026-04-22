import { Policy } from '@/types';
import { Home, Car, Building2, Shield, LucideIcon } from 'lucide-react';

export const getPolicyTypeInfo = (policy: Policy): { title: string; icon: LucideIcon } => {
  if (!policy.coverages || policy.coverages.length === 0) {
    return { title: 'Insurance Policy', icon: Shield };
  }

  const coverageString = JSON.stringify(policy.coverages).toLowerCase();

  if (coverageString.includes('collision') || coverageString.includes('bodily injury') || coverageString.includes('auto') || coverageString.includes('vehicle')) {
    return { title: 'Automobile Insurance', icon: Car };
  }
  
  if (coverageString.includes('dwelling') || coverageString.includes('personal property') || coverageString.includes('home')) {
    return { title: 'Homeowners Insurance', icon: Home };
  }
  
  if (coverageString.includes('crop') || coverageString.includes('livestock') || coverageString.includes('farm') || coverageString.includes('commercial') || coverageString.includes('business')) {
    return { title: 'Commercial/Farm Insurance', icon: Building2 };
  }

  return { title: 'Insurance Policy', icon: Shield };
};
