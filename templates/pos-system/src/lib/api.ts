import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE = import.meta.env.VITE_API_URL || "https://markets-api.jcampos.dev";
const CROSS_APP_API_BASE = import.meta.env.VITE_ORDERS_API_URL || "https://orders-api.jcampos.dev";

async function getToken(): Promise<string> {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() ?? "";
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  baseUrl: string = API_BASE
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  
  // Only add x-user-id header for cross-app-be API (not for markets API)
  if (baseUrl === CROSS_APP_API_BASE && token) {
    try {
      const [, payloadB64] = token.split('.');
      const { sub } = JSON.parse(atob(payloadB64));
      if (sub) headers['x-user-id'] = sub;
    } catch (e) {
      console.warn('Failed to extract user ID from token');
    }
  }
  
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }

  return res.json();
}

export function createClient(baseUrl: string) {
  return {
    get: <T>(path: string) => request<T>("GET", path, undefined, baseUrl),
    post: <T>(path: string, body: unknown) => request<T>("POST", path, body, baseUrl),
    patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body, baseUrl),
    delete: <T>(path: string) => request<T>("DELETE", path, undefined, baseUrl),
  };
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

export const crossAppApi = {
  get: <T>(path: string) => request<T>("GET", path, undefined, CROSS_APP_API_BASE),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body, CROSS_APP_API_BASE),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body, CROSS_APP_API_BASE),
  delete: <T>(path: string) => request<T>("DELETE", path, undefined, CROSS_APP_API_BASE),
};

export const ordersApi = {
  get: <T>(path: string) => request<T>("GET", path, undefined, CROSS_APP_API_BASE),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body, CROSS_APP_API_BASE),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body, CROSS_APP_API_BASE),
  delete: <T>(path: string) => request<T>("DELETE", path, undefined, CROSS_APP_API_BASE),
};

/** Build org-scoped API path (markets API) */
export function orgPath(userId: string, orgId: string, endpoint: string) {
  return `/api/users/${userId}/memberships/organization/${orgId}${endpoint}`;
}

/** Build user-scoped API path (markets API) */
export function userPath(userId: string, endpoint: string) {
  return `/api/users/${userId}${endpoint}`;
}

/** Build org-scoped API path for cross-app-be (sessions, assignments, branches, etc.) */
export function crossAppOrgPath(orgId: string, endpoint: string) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/api/organizations/${orgId}${cleanEndpoint}`;
}

/** Build org-scoped API path for orders/products API */
export function ordersOrgPath(orgId: string, endpoint: string) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/api/organizations/${orgId}${cleanEndpoint}`;
}
