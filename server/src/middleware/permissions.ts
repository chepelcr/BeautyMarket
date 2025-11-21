import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import type { IRBACService, PermissionCheck } from '../services/RBACService';

/**
 * Creates a middleware factory for permission checking.
 * This allows checking granular permissions based on module/action/submodule.
 */
export function createPermissionMiddleware(rbacService: IRBACService) {
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
        // Must have organization context
        if (!req.organization) {
          return res.status(400).json({
            error: 'Organization context required',
            message: 'Permission check requires organization context'
          });
        }

        // Must be authenticated
        if (!req.userId) {
          return res.status(401).json({
            error: 'Authentication required'
          });
        }

        // Check permission
        const hasPermission = await rbacService.hasPermission(
          req.userId,
          req.organization.id,
          { module, action, submodule }
        );

        if (!hasPermission) {
          return res.status(403).json({
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
        if (!req.organization) {
          return res.status(400).json({
            error: 'Organization context required'
          });
        }

        if (!req.userId) {
          return res.status(401).json({
            error: 'Authentication required'
          });
        }

        const hasAny = await rbacService.hasAnyPermission(
          req.userId,
          req.organization.id,
          permissions
        );

        if (!hasAny) {
          return res.status(403).json({
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
        if (!req.organization) {
          return res.status(400).json({
            error: 'Organization context required'
          });
        }

        if (!req.userId) {
          return res.status(401).json({
            error: 'Authentication required'
          });
        }

        const hasAll = await rbacService.hasAllPermissions(
          req.userId,
          req.organization.id,
          permissions
        );

        if (!hasAll) {
          return res.status(403).json({
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

  return {
    requirePermission,
    requireAnyPermission,
    requireAllPermissions
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
 * Middleware to require platform admin role.
 * Platform admins have access to all organizations.
 */
export function createRequirePlatformAdmin(rbacService: IRBACService) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      // Platform admin check would need a special implementation
      // For now, we check if user has platform_admin role in any context
      // This could be stored in the user table or a separate admin table

      // Placeholder: You'd implement actual platform admin check here
      const isPlatformAdmin = false; // await checkPlatformAdmin(req.userId);

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
