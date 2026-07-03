import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * API client for Pollo Porteño storefront.
 *
 * Strategy:
 *  - Calls the markets API (`VITE_API_URL`) for organization info, products and styles.
 *  - The visitor is an unauthenticated Cognito Identity Pool guest, so we attach
 *    the unauthenticated ID-token (when available) and the guest identity ID so
 *    the backend can scope public reads to the configured organization.
 *  - Public endpoints (`/api/public/...`) work without credentials, so the client
 *    silently falls back to anonymous fetch when no guest credentials are issued.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.tsuru.jcampos.dev';

export interface AnonymousAuthHeaders {
  Authorization?: string;
  'x-identity-id'?: string;
}

async function getAnonymousAuthHeaders(): Promise<AnonymousAuthHeaders> {
  try {
    // forceRefresh=false: re-use cached guest credentials if Amplify already issued them.
    const session = await fetchAuthSession();
    const headers: AnonymousAuthHeaders = {};

    const idToken = session.tokens?.idToken?.toString();
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }

    if (session.identityId) {
      headers['x-identity-id'] = session.identityId;
    }

    return headers;
  } catch {
    // No identity pool configured / network down — proceed unauthenticated.
    return {};
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const auth = await getAnonymousAuthHeaders();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...auth,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const anonymousApi = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
};

/** Build query string from filter object, omitting null/undefined entries. */
export function buildQuery(filters?: Record<string, unknown>): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
