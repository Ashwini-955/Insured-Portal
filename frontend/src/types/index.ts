export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Policy {
  _id?: string;
  policyNumber: string;
  policyType?: string;
  status?: string;
  effectiveDate?: string;
  expirationDate?: string;
  insured?: { email?: string };
  propertyAddress?: { addressLine1?: string; city?: string };
}

export interface Claim {
  _id?: string;
  claimNumber: string;
  policyNumber: string;
  title?: string;
  status?: string;
  filedDate?: string;
  amountClaimed?: number;
}

export interface Billing {
  _id?: string;
  billingId?: string;
  policyNumber: string;
  currentAmountDue?: number;
  currentDueDate?: string;
  projectedStatements?: Array<{ status: string; dueDate: string; totalAmountDue?: number }>;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}
