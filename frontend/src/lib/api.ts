import { config } from '@/config/env';
import type { LoginResponse, Policy, Claim, Billing } from '@/types';

export async function loginWithEmail(email: string): Promise<LoginResponse> {
  let res: Response;
  try {
    res = await fetch(`${config.api.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
  } catch {
    throw new Error(
      'Cannot reach server. Make sure the backend is running (e.g. node backend/server.js on port 5000).'
    );
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { method: 'GET', signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    throw new Error(
      'Cannot reach server. Make sure the backend is running (e.g. node backend/server.js on port 5000).'
    );
  }
  let data: { message?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error(res.ok ? 'Invalid response' : `Request failed (${res.status})`);
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data as T;
}

type ApiListResponse<T> = { success: boolean; count: number; data: T };

export async function getPoliciesByEmail(email: string, signal?: AbortSignal): Promise<Policy[]> {
  const out = await getJson<ApiListResponse<Policy[]>>(
    `${config.api.baseUrl}/policies/email/${encodeURIComponent(email.trim())}`,
    signal
  );
  return out.data ?? [];
}

export async function getClaimsByPolicyNumbers(policyNumbers: string[], signal?: AbortSignal): Promise<Claim[]> {
  if (policyNumbers.length === 0) return [];
  const q = policyNumbers.map((p) => encodeURIComponent(p)).join(',');
  const out = await getJson<ApiListResponse<Claim[]>>(
    `${config.api.baseUrl}/claims?policyNumbers=${q}`,
    signal
  );
  return out.data ?? [];
}

export async function getBillingByPolicyNumbers(policyNumbers: string[], signal?: AbortSignal): Promise<Billing[]> {
  if (policyNumbers.length === 0) return [];
  const q = policyNumbers.map((p) => encodeURIComponent(p)).join(',');
  const out = await getJson<ApiListResponse<Billing[]>>(
    `${config.api.baseUrl}/billing?policyNumbers=${q}`,
    signal
  );
  return out.data ?? [];
}

export async function createClaim(data: {
  policyNumber: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  description: string;
}): Promise<Claim> {
  let res: Response;
  try {
    res = await fetch(`${config.api.baseUrl}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, incidentDate: data.incidentDate }),
    });
  } catch {
    throw new Error('Cannot reach server.');
  }
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to create claim');
  return result.data;
}
