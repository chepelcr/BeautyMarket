import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Response, NextFunction } from 'express';
import {
  createPermissionMiddleware,
  requireAuth,
  createRequirePlatformAdmin,
  attachUserId,
} from '../permissions';
import type { IRBACService } from '../../services/RBACService';
import type { IUserRepository } from '../../types';
import type { AuthRequest } from '../../types/auth.types';

describe('Permission Middleware', () => {
  let mockRbacService: Partial<IRBACService>;
  let mockUserRepo: Partial<IUserRepository>;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Deny paths only respond when the rollout flag enforces (default is 'log')
    process.env.RBAC_ENFORCEMENT = 'enforce';

    mockRbacService = {
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      isMember: vi.fn(),
    };

    mockUserRepo = {
      getUser: vi.fn(),
    };

    mockReq = {
      userId: 'user-1',
      organization: { id: 'org-1', name: 'Test Org' } as any,
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  afterEach(() => {
    delete process.env.RBAC_ENFORCEMENT;
  });

  describe('createPermissionMiddleware', () => {
    describe('requirePermission', () => {
      it('should call next if user has permission', async () => {
        vi.mocked(mockRbacService.hasPermission!).mockResolvedValue(true);

        const { requirePermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requirePermission('products', 'create');

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRbacService.hasPermission).toHaveBeenCalledWith(
          'user-1',
          'org-1',
          { module: 'products', action: 'create', submodule: undefined }
        );
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      it('should call next with submodule permission', async () => {
        vi.mocked(mockRbacService.hasPermission!).mockResolvedValue(true);

        const { requirePermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requirePermission('settings', 'update', 'payment');

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRbacService.hasPermission).toHaveBeenCalledWith(
          'user-1',
          'org-1',
          { module: 'settings', action: 'update', submodule: 'payment' }
        );
        expect(mockNext).toHaveBeenCalled();
      });

      it('should return 400 if no organization context', async () => {
        mockReq.organization = undefined;

        const { requirePermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requirePermission('products', 'create');

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Organization context required',
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 if not authenticated', async () => {
        mockReq.userId = undefined;

        const { requirePermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requirePermission('products', 'create');

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Authentication required',
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 if permission denied', async () => {
        vi.mocked(mockRbacService.hasPermission!).mockResolvedValue(false);

        const { requirePermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requirePermission('products', 'delete');

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Permission denied',
            message: "You don't have permission to delete products",
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 with submodule in message', async () => {
        vi.mocked(mockRbacService.hasPermission!).mockResolvedValue(false);

        const { requirePermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requirePermission('settings', 'update', 'billing');

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "You don't have permission to update billing in settings",
          })
        );
      });

      it('should return 500 on service error', async () => {
        vi.mocked(mockRbacService.hasPermission!).mockRejectedValue(
          new Error('DB error')
        );

        const { requirePermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requirePermission('products', 'create');

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Failed to check permissions',
        });
      });
    });

    describe('requireAnyPermission', () => {
      it('should call next if user has any permission', async () => {
        vi.mocked(mockRbacService.hasAnyPermission!).mockResolvedValue(true);

        const { requireAnyPermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAnyPermission([
          { module: 'products', action: 'read' },
          { module: 'orders', action: 'read' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRbacService.hasAnyPermission).toHaveBeenCalledWith(
          'user-1',
          'org-1',
          [
            { module: 'products', action: 'read' },
            { module: 'orders', action: 'read' },
          ]
        );
        expect(mockNext).toHaveBeenCalled();
      });

      it('should return 400 if no organization context', async () => {
        mockReq.organization = undefined;

        const { requireAnyPermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAnyPermission([
          { module: 'products', action: 'read' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 if not authenticated', async () => {
        mockReq.userId = undefined;

        const { requireAnyPermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAnyPermission([
          { module: 'products', action: 'read' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 if no permissions match', async () => {
        vi.mocked(mockRbacService.hasAnyPermission!).mockResolvedValue(false);

        const { requireAnyPermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAnyPermission([
          { module: 'products', action: 'delete' },
          { module: 'orders', action: 'delete' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Permission denied',
          })
        );
      });

      it('should return 500 on service error', async () => {
        vi.mocked(mockRbacService.hasAnyPermission!).mockRejectedValue(
          new Error('DB error')
        );

        const { requireAnyPermission } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAnyPermission([
          { module: 'products', action: 'read' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
      });
    });

    describe('requireAllPermissions', () => {
      it('should call next if user has all permissions', async () => {
        vi.mocked(mockRbacService.hasAllPermissions!).mockResolvedValue(true);

        const { requireAllPermissions } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAllPermissions([
          { module: 'products', action: 'update' },
          { module: 'inventory', action: 'update' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRbacService.hasAllPermissions).toHaveBeenCalledWith(
          'user-1',
          'org-1',
          [
            { module: 'products', action: 'update' },
            { module: 'inventory', action: 'update' },
          ]
        );
        expect(mockNext).toHaveBeenCalled();
      });

      it('should return 400 if no organization context', async () => {
        mockReq.organization = undefined;

        const { requireAllPermissions } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAllPermissions([
          { module: 'products', action: 'update' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 if not authenticated', async () => {
        mockReq.userId = undefined;

        const { requireAllPermissions } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAllPermissions([
          { module: 'products', action: 'update' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 if not all permissions granted', async () => {
        vi.mocked(mockRbacService.hasAllPermissions!).mockResolvedValue(false);

        const { requireAllPermissions } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAllPermissions([
          { module: 'products', action: 'update' },
          { module: 'inventory', action: 'update' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "You don't have all required permissions for this action",
          })
        );
      });

      it('should return 500 on service error', async () => {
        vi.mocked(mockRbacService.hasAllPermissions!).mockRejectedValue(
          new Error('DB error')
        );

        const { requireAllPermissions } = createPermissionMiddleware(
          mockRbacService as IRBACService
        );
        const middleware = requireAllPermissions([
          { module: 'products', action: 'update' },
        ]);

        await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('requireAuth', () => {
    it('should call next if user is authenticated', () => {
      requireAuth()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      mockReq.userId = undefined;

      requireAuth()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Authentication required',
          message: 'Please sign in to access this resource',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('createRequirePlatformAdmin', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockReq.userId = undefined;

      const middleware = createRequirePlatformAdmin(
        mockUserRepo as IUserRepository
      );

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Authentication required',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for non-platform admin users', async () => {
      vi.mocked(mockUserRepo.getUser!).mockResolvedValue({
        id: 'user-1',
        role: 'customer',
      } as any);

      const middleware = createRequirePlatformAdmin(
        mockUserRepo as IUserRepository
      );

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access denied',
          message: 'Platform administrator privileges required',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next for users with users.role === platform_admin', async () => {
      vi.mocked(mockUserRepo.getUser!).mockResolvedValue({
        id: 'user-1',
        role: 'platform_admin',
      } as any);

      const middleware = createRequirePlatformAdmin(
        mockUserRepo as IUserRepository
      );

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('attachUserId', () => {
    it('should prefer the :userId path param', () => {
      const req = { params: { userId: 'path-user' }, headers: {} } as unknown as AuthRequest;

      attachUserId()(req, mockRes as Response, mockNext);

      expect(req.userId).toBe('path-user');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fall back to the bearer payload sub claim', () => {
      const payload = Buffer.from(JSON.stringify({ sub: 'token-user' })).toString('base64url');
      const req = {
        params: {},
        headers: { authorization: `Bearer x.${payload}.y` },
      } as unknown as AuthRequest;

      attachUserId()(req, mockRes as Response, mockNext);

      expect(req.userId).toBe('token-user');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should leave userId unset on malformed tokens', () => {
      const req = {
        params: {},
        headers: { authorization: 'Bearer not-a-jwt' },
      } as unknown as AuthRequest;

      attachUserId()(req, mockRes as Response, mockNext);

      expect(req.userId).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('RBAC_ENFORCEMENT rollout flag', () => {
    it("should pass through denials in 'log' mode", async () => {
      process.env.RBAC_ENFORCEMENT = 'log';
      vi.mocked(mockRbacService.hasPermission!).mockResolvedValue(false);

      const { requirePermission } = createPermissionMiddleware(
        mockRbacService as IRBACService
      );
      const middleware = requirePermission('products', 'delete');

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should skip evaluation entirely in 'off' mode", async () => {
      process.env.RBAC_ENFORCEMENT = 'off';

      const { requirePermission } = createPermissionMiddleware(
        mockRbacService as IRBACService
      );
      const middleware = requirePermission('products', 'delete');

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRbacService.hasPermission).not.toHaveBeenCalled();
    });
  });

  describe('requireMembership', () => {
    it('should call next for members', async () => {
      vi.mocked(mockRbacService.isMember!).mockResolvedValue(true);

      const { requireMembership } = createPermissionMiddleware(
        mockRbacService as IRBACService
      );

      await requireMembership()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRbacService.isMember).toHaveBeenCalledWith('user-1', 'org-1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 for non-members regardless of the rollout flag', async () => {
      process.env.RBAC_ENFORCEMENT = 'log';
      vi.mocked(mockRbacService.isMember!).mockResolvedValue(false);

      const { requireMembership } = createPermissionMiddleware(
        mockRbacService as IRBACService
      );

      await requireMembership()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
