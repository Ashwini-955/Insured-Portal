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
  accountId?: string;
  insured?: {
    email?: string;
  };
  propertyAddress?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  coverages?: Array<{
    name?: string;
    limit?: number;
  }>;
}

export interface Claim {
  _id?: string;
  ClaimNumber: string;
  PolicyNumber: string;
  Status?: string;
  ReceivedDate?: string;
  LossDate?: string;
  DescriptionOfLoss?: string;
  Location?: string;
  IncidentTime?: string;
  PaidLoss?: number;
  AccidentCode?: string;
}

export interface Billing {
  _id?: string;
  PolicyNumber: string;
  payPlanDesc?: string;
  isRecurringPayment?: boolean;
  accountTotalBalance?: number;
  currentAmountDue?: number;
  currentDueDate?: string;
  projectedStatements?: Array<{ 
    status: string; 
    policy?: string;
    statementDate?: string;
    statementDueDate: string; 
    statementTotalAmountDue?: number;
    statementDurationPaid?: number;
  }>;
}

export interface Invoice {
  status: string; 
  policy?: string;
  statementDate?: string;
  statementDueDate: string; 
  statementTotalAmountDue?: number;
  statementDurationPaid?: number;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}
