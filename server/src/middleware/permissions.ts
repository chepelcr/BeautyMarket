import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import type { IRBACService, PermissionCheck } from '../services/RBACService';
import type { IUserRepository } from '../types';

type EnforcementMode = 'enforce' | 'log' | 'off';

/**
 * RBAC_ENFORCEMENT rollout flag (V5/V7):
 * - 'off'     → skip checks entirely
 * - 'log'     → evaluate, log denials, but let the request through (DEFAULT
 *               until the POS role UI ships)
 * - 'enforce' → 403 on deny
 */
function getEnforcementMode(): EnforcementMode {
  const mode = (process.env.RBAC_ENFORCEMENT || 'log').toLowerCase();
  if (mode === 'enforce' || mode === 'off') return mode;
  return 'log';
}

/**
 * Resolve the organization id for permission checks. The org-scoped router is
 * mounted at /api/users/:userId/organization/:orgId (routes.ts), so the path
 * param is `orgId` — `organizationId` is kept as a fallback for legacy mounts.
 */
function resolveOrganizationId(req: AuthRequest): string | undefined {
  return req.params?.orgId || req.params?.organizationId || req.organization?.id;
}

/**
 * Populate req.userId.
 *
 * Preferred source: the `:userId` path param — API Gateway already validates
 * that it matches the JWT `sub` claim (see CLAUDE.md security model).
 * Fallback (for /api/admin and local dev): decode the Authorization Bearer
 * JWT payload and use `sub` (signature is verified at the edge by API
 * Gateway; local dev tolerates decode-only).
 */
export function attachUserId() {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (req.params?.userId) {
      req.userId = req.params.userId;
      return next();
    }

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice('Bearer '.length);
        const payloadPart = token.split('.')[1];
        if (payloadPart) {
          const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
          if (payload && typeof payload.sub === 'string') {
            req.userId = payload.sub;
          }
        }
      } catch {
        // malformed token — leave req.userId unset; guards below will 401
      }
    }

    next();
  };
}

/**
 * Creates a middleware factory for permission checking.
 * This allows checking granular permissions based on module/action/submodule.
 */
export function createPermissionMiddleware(rbacService: IRBACService) {
  function deny(req: AuthRequest, res: Response, next: NextFunction, status: number, body: Record<string, string>): void {
    const mode = getEnforcementMode();
    if (mode === 'log') {
      console.warn(`[RBAC:log] would deny ${req.method} ${req.originalUrl} (${status}): ${body.error}${body.message ? ` — ${body.message}` : ''}`);
      return next();
    }
    res.status(status).json(body);
  }

  /**
   * Middleware to check if user has a specific permission.
   *
   * @example
   * router.post('/products', requirePermission('products', 'create'), createProduct);
   * router.get('/orders', requirePermission('orders', 'read'), listOrders);
   * router.put('/settings/payment', requirePermission('settings', 'update', 'payment'), updatePayment);
   */
  function requirePermission(module: string, action: string, submodule?: string) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (getEnforcementMode() === 'off') return next();

        // Extract organization ID from path params
        const organizationId = resolveOrganizationId(req);

        if (!organizationId) {
          return deny(req, res, next, 400, {
            error: 'Organization context required',
            message: 'Permission check requires organization context'
          });
        }

        // Must be authenticated
        if (!req.userId) {
          return deny(req, res, next, 401, {
            error: 'Authentication required'
          });
        }

        // Check permission
        const hasPermission = await rbacService.hasPermission(
          req.userId,
          organizationId,
          { module, action, submodule }
        );

        if (!hasPermission) {
          return deny(req, res, next, 403, {
            error: 'Permission denied',
            message: `You don't have permission to ${action} ${submodule ? `${submodule} in ` : ''}${module}`
          });
        }

        next();
      } catch (error) {
        console.error('Error checking permission:', error);
        res.status(500).json({ error: 'Failed to check permissions' });
      }
    };
  }

  /**
   * Middleware to check if user has ANY of the specified permissions.
   *
   * @example
   * router.get('/dashboard', requireAnyPermission([
   *   { module: 'products', action: 'read' },
   *   { module: 'orders', action: 'read' }
   * ]), showDashboard);
   */
  function requireAnyPermission(permissions: PermissionCheck[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (getEnforcementMode() === 'off') return next();

        const organizationId = resolveOrganizationId(req);

        if (!organizationId) {
          return deny(req, res, next, 400, {
            error: 'Organization context required'
          });
        }

        if (!req.userId) {
          return deny(req, res, next, 401, {
            error: 'Authentication required'
          });
        }

        const hasAny = await rbacService.hasAnyPermission(
          req.userId,
          organizationId,
          permissions
        );

        if (!hasAny) {
          return deny(req, res, next, 403, {
            error: 'Permission denied',
            message: 'You don\'t have any of the required permissions for this action'
          });
        }

        next();
      } catch (error) {
        console.error('Error checking permissions:', error);
        res.status(500).json({ error: 'Failed to check permissions' });
      }
    };
  }

  /**
   * Middleware to check if user has ALL of the specified permissions.
   *
   * @example
   * router.post('/bulk-update', requireAllPermissions([
   *   { module: 'products', action: 'update' },
   *   { module: 'inventory', action: 'update' }
   * ]), bulkUpdate);
   */
  function requireAllPermissions(permissions: PermissionCheck[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (getEnforcementMode() === 'off') return next();

        const organizationId = resolveOrganizationId(req);

        if (!organizationId) {
          return deny(req, res, next, 400, {
            error: 'Organization context required'
          });
        }

        if (!req.userId) {
          return deny(req, res, next, 401, {
            error: 'Authentication required'
          });
        }

        const hasAll = await rbacService.hasAllPermissions(
          req.userId,
          organizationId,
          permissions
        );

        if (!hasAll) {
          return deny(req, res, next, 403, {
            error: 'Permission denied',
            message: 'You don\'t have all required permissions for this action'
          });
        }

        next();
      } catch (error) {
        console.error('Error checking permissions:', error);
        res.status(500).json({ error: 'Failed to check permissions' });
      }
    };
  }

  /**
   * Membership-only guard (O1/O14/O15): the caller must be a member of the
   * :orgId organization. Not subject to the RBAC_ENFORCEMENT flag — this is
   * tenancy isolation, not a granular permission.
   */
  function requireMembership() {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const organizationId = resolveOrganizationId(req);

        if (!organizationId) {
          return res.status(400).json({
            error: 'Organization context required'
          });
        }

        if (!req.userId) {
          return res.status(401).json({
            error: 'Authentication required'
          });
        }

        const isMember = await rbacService.isMember(req.userId, organizationId);
        if (!isMember) {
          return res.status(403).json({
            error: 'Permission denied',
            message: 'You are not a member of this organization'
          });
        }

        next();
      } catch (error) {
        console.error('Error checking membership:', error);
        res.status(500).json({ error: 'Failed to check membership' });
      }
    };
  }

  return {
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    requireMembership
  };
}

/**
 * Simple middleware to require authentication.
 * This should be applied before any permission checks.
 */
export function requireAuth() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }
    next();
  };
}

/**
 * Middleware to require platform admin role (users.role === 'platform_admin').
 * Platform admins manage the module/submodule/action catalogs and per-org
 * module assignments via /api/admin. NOT subject to the RBAC_ENFORCEMENT
 * flag — this is a hard gate on a brand-new surface.
 *
 * ADMIN_AUTH_MODE=open allows anonymous access to /api/admin while the
 * dedicated admin Cognito user pool does not exist yet. Must be removed /
 * set to 'cognito' (default) once the admin Cognito stack ships.
 */
export function createRequirePlatformAdmin(userRepository: IUserRepository) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if ((process.env.ADMIN_AUTH_MODE || 'cognito').toLowerCase() === 'open') {
        return next();
      }

      if (!req.userId) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const user = await userRepository.getUser(req.userId);
      const isPlatformAdmin = user?.role === 'platform_admin';

      if (!isPlatformAdmin) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Platform administrator privileges required'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking platform admin:', error);
      res.status(500).json({ error: 'Failed to check admin status' });
    }
  };
}
