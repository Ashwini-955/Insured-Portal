export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Policy {
  _id?: string;
  PolicyNumber: string;
  PolicyStatus?: string;
  EffectiveDate?: string;
  ExpirationDate?: string;
  AccountId?: string;
  ClientInformation?: {
    Communications?: Array<{ Type: string; Value: string }>;
  };
}

export interface Claim {
  _id?: string;
  ClaimNumber: string;
  PolicyNumber: string;
  Status?: string;
  ReceivedDate?: string;
  PaidLoss?: number;
  AccidentCode?: string;
}

export interface Billing {
  _id?: string;
  PolicyNumber: string;
  currentAmountDue?: number;
  currentDueDate?: string;
  projectedStatements?: Array<{ status: string; statementDueDate: string; statementTotalAmountDue?: number }>;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}
