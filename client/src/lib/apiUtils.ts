/**
 * API URL builder utilities for domain-based routing
 *
 * These utilities construct URLs following the pattern:
 * /api/user/{userId}/organization/{orgId}/{resource}
 */

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
  return `/api/user/${userId}/organization/${organizationId}${cleanEndpoint}`;
}

/**
 * Build a URL for user-scoped API endpoints (not organization-specific)
 * @param userId - The user ID
 * @param endpoint - The endpoint path (e.g., '/profile', '/organizations')
 * @returns Full API URL
 */
export function buildUserApiUrl(userId: string, endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/api/user/${userId}${cleanEndpoint}`;
}

/**
 * Build a URL for public/flat API endpoints
 * @param endpoint - The endpoint path
 * @returns Full API URL
 */
export function buildPublicApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/api${cleanEndpoint}`;
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
  const userOrgMatch = url.match(/^\/api\/user\/([^\/]+)\/organization\/([^\/]+)(.*)$/);
  if (userOrgMatch) {
    return {
      userId: userOrgMatch[1],
      organizationId: userOrgMatch[2],
      endpoint: userOrgMatch[3] || '/'
    };
  }

  const userMatch = url.match(/^\/api\/user\/([^\/]+)(.*)$/);
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
