import { config } from '@/config/env';
import type { LoginResponse, Policy, Claim, Billing } from '@/types';

export async function loginWithEmail(email: string): Promise<LoginResponse> {
  const res = await fetch(`${config.api.baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

type ApiListResponse<T> = { success: boolean; count: number; data: T };

export async function getPoliciesByEmail(email: string): Promise<Policy[]> {
  const out = await getJson<ApiListResponse<Policy[]>>(
    `${config.api.baseUrl}/policies/email/${encodeURIComponent(email.trim())}`
  );
  return out.data ?? [];
}

export async function getClaimsByEmail(email: string): Promise<Claim[]> {
  const out = await getJson<ApiListResponse<Claim[]>>(
    `${config.api.baseUrl}/claims/email/${encodeURIComponent(email.trim())}`
  );
  return out.data ?? [];
}

export async function getBillingByEmail(email: string): Promise<Billing[]> {
  const out = await getJson<ApiListResponse<Billing[]>>(
    `${config.api.baseUrl}/billing/email/${encodeURIComponent(email.trim())}`
  );
  return out.data ?? [];
}
