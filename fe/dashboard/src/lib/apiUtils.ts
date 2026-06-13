/**
 * API URL builder utilities for domain-based routing
 *
 * These utilities construct URLs following the pattern:
 * /api/users/{userId}/organization/{orgId}/{resource}
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ORDERS_API_BASE_URL = import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:8000';
const DATA_API_BASE_URL = import.meta.env.VITE_DATA_API_URL || 'https://data-api.jcampos.dev';

/**
 * Build a URL for organization-scoped API endpoints
 * @param userId - The user ID
 * @param organizationId - The organization ID
 * @param endpoint - The endpoint path (e.g., '/products', '/categories')
 * @returns Full API URL
 */
export function buildOrgApiUrl(
  userId: string,
  organizationId: string,
  endpoint: string
): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}/api/users/${userId}/organization/${organizationId}${cleanEndpoint}`;
}

/**
 * Build a URL for orders service organization-scoped endpoints
 * Used for products, categories, orders, clients, confirmations, branches, terminals, sessions, etc.
 * @param organizationId - The organization ID
 * @param endpoint - The endpoint path (e.g., '/products', '/categories', '/orders', '/branches', '/terminals')
 * @returns Full Orders API URL
 */
export function buildOrdersApiUrl(
  organizationId: string,
  endpoint: string
): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${ORDERS_API_BASE_URL}/api/organizations/${organizationId}${cleanEndpoint}`;
}

/**
 * Build a URL for user-scoped API endpoints (not organization-specific)
 * @param userId - The user ID
 * @param endpoint - The endpoint path (e.g., '/profile', '/organizations')
 * @returns Full API URL
 */
export function buildUserApiUrl(userId: string, endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}/api/users/${userId}${cleanEndpoint}`;
}

/**
 * Build a URL for public/flat API endpoints
 * @param endpoint - The endpoint path
 * @returns Full API URL
 */
export function buildPublicApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}/api${cleanEndpoint}`;
}

/**
 * Build a URL for Data API endpoints
 * @param endpoint - The endpoint path (e.g., '/countries/188/document-versions')
 * @param params - Optional query parameters
 * @returns Full Data API URL
 */
export function buildDataApiUrl(
  endpoint: string,
  params?: Record<string, any>
): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(cleanEndpoint, DATA_API_BASE_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * API context for building URLs
 */
export interface ApiContext {
  userId?: string;
  organizationId?: string;
}

/**
 * Create a URL builder with pre-set context
 * @param context - The API context with userId and organizationId
 * @returns Object with URL builder methods
 */
export function createApiUrlBuilder(context: ApiContext) {
  return {
    /**
     * Build organization-scoped URL
     * @throws Error if userId or organizationId is not set in context
     */
    org(endpoint: string): string {
      if (!context.userId || !context.organizationId) {
        throw new Error('userId and organizationId are required for organization-scoped endpoints');
      }
      return buildOrgApiUrl(context.userId, context.organizationId, endpoint);
    },

    /**
     * Build user-scoped URL
     * @throws Error if userId is not set in context
     */
    user(endpoint: string): string {
      if (!context.userId) {
        throw new Error('userId is required for user-scoped endpoints');
      }
      return buildUserApiUrl(context.userId, endpoint);
    },

    /**
     * Build public URL (no context required)
     */
    public(endpoint: string): string {
      return buildPublicApiUrl(endpoint);
    },

    /**
     * Build Data API URL (no context required)
     */
    data(endpoint: string, params?: Record<string, any>): string {
      return buildDataApiUrl(endpoint, params);
    }
  };
}

/**
 * Helper to extract URL parameters from a domain-based route
 */
export function parseApiUrl(url: string): {
  userId?: string;
  organizationId?: string;
  endpoint: string;
} {
  const userOrgMatch = url.match(/^\/api\/users\/([^\/]+)\/organization\/([^\/]+)(.*)$/);
  if (userOrgMatch) {
    return {
      userId: userOrgMatch[1],
      organizationId: userOrgMatch[2],
      endpoint: userOrgMatch[3] || '/'
    };
  }

  const userMatch = url.match(/^\/api\/users\/([^\/]+)(.*)$/);
  if (userMatch) {
    return {
      userId: userMatch[1],
      endpoint: userMatch[2] || '/'
    };
  }

  const publicMatch = url.match(/^\/api(.*)$/);
  if (publicMatch) {
    return {
      endpoint: publicMatch[1] || '/'
    };
  }

  return { endpoint: url };
}
