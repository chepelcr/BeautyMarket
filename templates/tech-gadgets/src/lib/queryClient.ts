import { QueryClient, QueryFunction } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Make an authenticated API request with automatic JWT token injection
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param url - API endpoint URL
 * @param data - Optional request body data
 * @returns Response object
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Build headers with Content-Type if data is provided
  const headers: Record<string, string> = {};
  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  // Add Cognito authentication token
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (error) {
    // No auth session available, continue without token
    console.warn('No auth session available for API request');
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';

/**
 * Create a query function with automatic JWT token injection
 * @param options - Configuration for handling 401 responses
 * @returns QueryFunction for React Query
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join('/') as string;

    try {
      // Build headers with auth token
      const headers: Record<string, string> = {};
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (idToken) {
          headers.Authorization = `Bearer ${idToken}`;
        }
      } catch (error) {
        // No auth session available
      }

      const fullUrl = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE_URL}${endpoint}`;

      const res = await fetch(fullUrl, {
        credentials: 'include',
        headers,
      });

      if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      throw error;
    }
  };

/**
 * React Query client with automatic JWT injection and sensible defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
