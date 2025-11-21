import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import type { IOrganizationService } from '../services/OrganizationService';
import type { IRBACService } from '../services/RBACService';

/**
 * Middleware to extract organization context from the request.
 *
 * Organization can be determined from (in priority order):
 * 1. Route parameters (userId, orgId) - for domain-based routing
 * 2. X-Organization-ID header (for explicit organization selection)
 * 3. Subdomain (e.g., storename.jmarkets.jcampos.dev)
 * 4. Custom domain (e.g., www.customstore.com)
 * 5. Query parameter (for API testing)
 */
export function createOrganizationContextMiddleware(
  organizationService: IOrganizationService,
  rbacService: IRBACService
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let organization = null;

      // 1. Check route parameters first (domain-based routing)
      const routeUserId = req.params.userId;
      const routeOrgId = req.params.orgId;

      if (routeOrgId) {
        organization = await organizationService.getById(routeOrgId);

        // Validate that the authenticated user matches the route userId
        if (routeUserId && req.userId && routeUserId !== req.userId) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'User ID in route does not match authenticated user'
          });
        }

        // Set route userId on request if not already set from auth
        if (routeUserId && !req.userId) {
          req.userId = routeUserId;
        }
      }

      // 2. Check X-Organization-ID header (explicit selection)
      if (!organization) {
        const orgIdHeader = req.headers['x-organization-id'] as string;
        if (orgIdHeader) {
          organization = await organizationService.getById(orgIdHeader);
        }
      }

      // 3. Check subdomain
      if (!organization) {
        const host = req.hostname || req.headers.host?.split(':')[0] || '';
        const baseDomain = process.env.BASE_DOMAIN || 'jmarkets.jcampos.dev';

        if (host.endsWith(baseDomain) && host !== baseDomain && host !== `www.${baseDomain}`) {
          const subdomain = host.replace(`.${baseDomain}`, '');
          organization = await organizationService.getBySubdomain(subdomain);
        }
      }

      // 4. Check custom domain
      if (!organization) {
        const host = req.hostname || req.headers.host?.split(':')[0] || '';
        const baseDomain = process.env.BASE_DOMAIN || 'jmarkets.jcampos.dev';

        // If not on the base domain, it might be a custom domain
        if (!host.endsWith(baseDomain)) {
          organization = await organizationService.getByCustomDomain(host);
        }
      }

      // 5. Check query parameter (for development/testing)
      if (!organization && req.query.organizationId) {
        organization = await organizationService.getById(req.query.organizationId as string);
      }

      // Set organization context on request
      if (organization) {
        req.organization = organization;
        req.organizationId = organization.id;

        // If user is authenticated, get their role in this organization
        if (req.userId) {
          const userRole = await rbacService.getUserRole(req.userId, organization.id);
          if (userRole) {
            req.userRole = userRole;
            req.isOwner = userRole.name === 'owner';
            req.isAdmin = userRole.name === 'owner' || userRole.name === 'admin';
          }
        }
      }

      next();
    } catch (error) {
      console.error('Error in organization context middleware:', error);
      next();
    }
  };
}

/**
 * Middleware to extract user context from route parameters.
 * Used for user-scoped routes like /api/user/:userId/...
 */
export function createUserContextMiddleware() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const routeUserId = req.params.userId;

    if (routeUserId) {
      // Validate that the authenticated user matches the route userId
      if (req.userId && routeUserId !== req.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'User ID in route does not match authenticated user'
        });
      }

      // Set route userId on request if not already set from auth
      if (!req.userId) {
        req.userId = routeUserId;
      }
    }

    next();
  };
}

/**
 * Middleware to require organization context.
 * Returns 400 if no organization is found in the request.
 */
export function requireOrganization() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.organization) {
      return res.status(400).json({
        error: 'Organization context required',
        message: 'Please specify an organization via X-Organization-ID header, subdomain, or custom domain'
      });
    }
    next();
  };
}

/**
 * Middleware to require organization membership.
 * Returns 403 if user is not a member of the current organization.
 */
export function requireOrganizationMembership() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.organization) {
      return res.status(400).json({
        error: 'Organization context required'
      });
    }

    if (!req.userRole) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You are not a member of this organization'
      });
    }

    next();
  };
}

/**
 * Middleware to require owner or admin role in the current organization.
 */
export function requireOrganizationAdmin() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.organization) {
      return res.status(400).json({
        error: 'Organization context required'
      });
    }

    if (!req.isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin privileges required for this action'
      });
    }

    next();
  };
}

/**
 * Middleware to require owner role in the current organization.
 */
export function requireOrganizationOwner() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.organization) {
      return res.status(400).json({
        error: 'Organization context required'
      });
    }

    if (!req.isOwner) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Owner privileges required for this action'
      });
    }

    next();
  };
}
