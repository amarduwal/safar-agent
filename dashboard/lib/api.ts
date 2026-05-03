// SAFAR API client
// No authentication required for demo — production would add JWT/session tokens.
// All functions throw on non-2xx responses so callers can show error UI.

import type {
  FamilyLookupResponse,
  NgoCasesResponse,
  StatsResponse,
} from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

/**
 * Look up a worker by the family member's registered phone number.
 * Used by the Family view to find a loved one's status.
 */
export async function getWorkerByPhone(
  phone: string,
): Promise<FamilyLookupResponse> {
  // Normalise phone: strip spaces and leading zeros for consistency
  const normalised = phone.replace(/\s+/g, '').replace(/^0+/, '');
  return apiFetch<FamilyLookupResponse>(`/family/${encodeURIComponent(normalised)}`);
}

/**
 * Fetch all active cases for the NGO dashboard.
 * Returns cases pre-sorted by severity (server may do this; client also sorts).
 */
export async function getNgoCases(): Promise<NgoCasesResponse> {
  return apiFetch<NgoCasesResponse>('/ngo/cases');
}

/**
 * Fetch aggregate monitoring statistics shown in the NGO summary bar.
 */
export async function getStats(): Promise<StatsResponse> {
  return apiFetch<StatsResponse>('/stats');
}
