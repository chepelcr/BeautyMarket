import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  createOrganizationContextMiddleware,
  requireOrganization,
  requireOrganizationMembership,
  requireOrganizationAdmin,
  requireOrganizationOwner,
} from '../organizationContext';
import type { IOrganizationService } from '../../services/OrganizationService';
import type { IRBACService } from '../../services/RBACService';
import type { AuthRequest } from '../../types/auth.types';

describe('Organization Context Middleware', () => {
  let mockOrgService: Partial<IOrganizationService>;
  let mockRbacService: Partial<IRBACService>;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockOrgService = {
      getById: vi.fn(),
      getBySubdomain: vi.fn(),
      getByCustomDomain: vi.fn(),
    };

    mockRbacService = {
      getUserRole: vi.fn(),
    };

    mockReq = {
      headers: {},
      hostname: 'localhost',
      query: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe('createOrganizationContextMiddleware', () => {
    it('should extract organization from X-Organization-ID header', async () => {
      const mockOrg = { id: 'org-1', name: 'Test Org' };
      mockReq.headers = { 'x-organization-id': 'org-1' };
      vi.mocked(mockOrgService.getById!).mockResolvedValue(mockOrg as any);

      const middleware = createOrganizationContextMiddleware(
        mockOrgService as IOrganizationService,
        mockRbacService as IRBACService
      );

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.organization).toEqual(mockOrg);
      expect(mockReq.organizationId).toBe('org-1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract organization from subdomain', async () => {
      const mockOrg = { id: 'org-1', name: 'Test Org' };
      mockReq.hostname = 'mystore.jmarkets.jcampos.dev';
      process.env.BASE_DOMAIN = 'jmarkets.jcampos.dev';
      vi.mocked(mockOrgService.getBySubdomain!).mockResolvedValue(mockOrg as any);

      const middleware = createOrganizationContextMiddleware(
        mockOrgService as IOrganizationService,
        mockRbacService as IRBACService
      );

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockOrgService.getBySubdomain).toHaveBeenCalledWith('mystore');
      expect(mockReq.organization).toEqual(mockOrg);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract organization from custom domain', async () => {
      const mockOrg = { id: 'org-1', name: 'Test Org' };
      mockReq.hostname = 'www.customstore.com';
      process.env.BASE_DOMAIN = 'jmarkets.jcampos.dev';
      vi.mocked(mockOrgService.getByCustomDomain!).mockResolvedValue(mockOrg as any);

      const middleware = createOrganizationContextMiddleware(
        mockOrgService as IOrganizationService,
        mockRbacService as IRBACService
      );

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockOrgService.getByCustomDomain).toHaveBeenCalledWith('www.customstore.com');
      expect(mockReq.organization).toEqual(mockOrg);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set user role if authenticated', async () => {
      const mockOrg = { id: 'org-1', name: 'Test Org' };
      const mockRole = { id: 'role-1', name: 'owner' };
      mockReq.headers = { 'x-organization-id': 'org-1' };
      mockReq.userId = 'user-1';
      vi.mocked(mockOrgService.getById!).mockResolvedValue(mockOrg as any);
      vi.mocked(mockRbacService.getUserRole!).mockResolvedValue(mockRole as any);

      const middleware = createOrganizationContextMiddleware(
        mockOrgService as IOrganizationService,
        mockRbacService as IRBACService
      );

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.userRole).toEqual(mockRole);
      expect(mockReq.isOwner).toBe(true);
      expect(mockReq.isAdmin).toBe(true);
    });

    it('should continue without organization if not found', async () => {
      vi.mocked(mockOrgService.getById!).mockResolvedValue(null);

      const middleware = createOrganizationContextMiddleware(
        mockOrgService as IOrganizationService,
        mockRbacService as IRBACService
      );

      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.organization).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireOrganization', () => {
    it('should call next if organization exists', () => {
      mockReq.organization = { id: 'org-1' } as any;

      requireOrganization()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 400 if no organization', () => {
      requireOrganization()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Organization context required',
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireOrganizationMembership', () => {
    it('should call next if user has role', () => {
      mockReq.organization = { id: 'org-1' } as any;
      mockReq.userRole = { id: 'role-1', name: 'staff' } as any;

      requireOrganizationMembership()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user has no role', () => {
      mockReq.organization = { id: 'org-1' } as any;

      requireOrganizationMembership()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Access denied',
      }));
    });
  });

  describe('requireOrganizationAdmin', () => {
    it('should call next if user is admin', () => {
      mockReq.organization = { id: 'org-1' } as any;
      mockReq.isAdmin = true;

      requireOrganizationAdmin()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user is not admin', () => {
      mockReq.organization = { id: 'org-1' } as any;
      mockReq.isAdmin = false;

      requireOrganizationAdmin()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireOrganizationOwner', () => {
    it('should call next if user is owner', () => {
      mockReq.organization = { id: 'org-1' } as any;
      mockReq.isOwner = true;

      requireOrganizationOwner()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user is not owner', () => {
      mockReq.organization = { id: 'org-1' } as any;
      mockReq.isOwner = false;

      requireOrganizationOwner()(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
