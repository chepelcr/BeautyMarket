import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { OrganizationController } from '../OrganizationController';
import type { IOrganizationService } from '../../services/OrganizationService';
import type { IRBACService } from '../../services/RBACService';
import type { TemplateCloneService } from '../../services/TemplateCloneService';
import type { OrganizationMemberRepository } from '../../repositories/OrganizationMemberRepository';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let mockOrgService: Partial<IOrganizationService>;
  let mockRbacService: Partial<IRBACService>;
  let mockTemplateCloneService: Partial<TemplateCloneService>;
  let mockMemberRepo: Partial<OrganizationMemberRepository>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockOrgService = {
      getAll: vi.fn(),
      getById: vi.fn(),
      getBySlug: vi.fn(),
      getBySubdomain: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateSettings: vi.fn(),
      delete: vi.fn(),
      checkSlugAvailable: vi.fn(),
      checkSubdomainAvailable: vi.fn(),
    };

    mockRbacService = {};
    mockTemplateCloneService = {};
    mockMemberRepo = {};

    controller = new OrganizationController(
      mockOrgService as IOrganizationService,
      mockRbacService as IRBACService,
      mockTemplateCloneService as TemplateCloneService,
      mockMemberRepo as OrganizationMemberRepository
    );

    mockReq = {
      params: {},
      body: {},
      query: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getAll', () => {
    it('should return all organizations', async () => {
      const mockOrgs = [
        { id: '1', name: 'Org 1' },
        { id: '2', name: 'Org 2' },
      ];
      vi.mocked(mockOrgService.getAll!).mockResolvedValue(mockOrgs as any);

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(mockOrgs);
    });

    it('should return 500 on error', async () => {
      vi.mocked(mockOrgService.getAll!).mockRejectedValue(new Error('DB error'));

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to fetch organizations',
      });
    });
  });

  describe('getById', () => {
    it('should return organization when found', async () => {
      const mockOrg = { id: '1', name: 'Test Org' };
      mockReq.params = { id: '1' };
      vi.mocked(mockOrgService.getById!).mockResolvedValue(mockOrg as any);

      await controller.getById(mockReq as Request, mockRes as Response);

      expect(mockOrgService.getById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith(mockOrg);
    });

    it('should return 404 when not found', async () => {
      mockReq.params = { id: '999' };
      vi.mocked(mockOrgService.getById!).mockResolvedValue(null);

      await controller.getById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Organization not found',
      });
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: '1' };
      vi.mocked(mockOrgService.getById!).mockRejectedValue(new Error('DB error'));

      await controller.getById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getBySlug', () => {
    it('should return organization by slug', async () => {
      const mockOrg = { id: '1', slug: 'test-org' };
      mockReq.params = { slug: 'test-org' };
      vi.mocked(mockOrgService.getBySlug!).mockResolvedValue(mockOrg as any);

      await controller.getBySlug(mockReq as Request, mockRes as Response);

      expect(mockOrgService.getBySlug).toHaveBeenCalledWith('test-org');
      expect(mockRes.json).toHaveBeenCalledWith(mockOrg);
    });

    it('should return 404 when slug not found', async () => {
      mockReq.params = { slug: 'unknown' };
      vi.mocked(mockOrgService.getBySlug!).mockResolvedValue(null);

      await controller.getBySlug(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getBySubdomain', () => {
    it('should return organization by subdomain', async () => {
      const mockOrg = { id: '1', subdomain: 'mystore' };
      mockReq.params = { subdomain: 'mystore' };
      vi.mocked(mockOrgService.getBySubdomain!).mockResolvedValue(mockOrg as any);

      await controller.getBySubdomain(mockReq as Request, mockRes as Response);

      expect(mockOrgService.getBySubdomain).toHaveBeenCalledWith('mystore');
      expect(mockRes.json).toHaveBeenCalledWith(mockOrg);
    });

    it('should return 404 when subdomain not found', async () => {
      mockReq.params = { subdomain: 'unknown' };
      vi.mocked(mockOrgService.getBySubdomain!).mockResolvedValue(null);

      await controller.getBySubdomain(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('checkSlugAvailable', () => {
    it('should return available true when slug is free', async () => {
      mockReq.params = { slug: 'new-org' };
      vi.mocked(mockOrgService.checkSlugAvailable!).mockResolvedValue(true);

      await controller.checkSlugAvailable(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({ available: true });
    });

    it('should return available false when slug is taken', async () => {
      mockReq.params = { slug: 'existing-org' };
      vi.mocked(mockOrgService.checkSlugAvailable!).mockResolvedValue(false);

      await controller.checkSlugAvailable(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({ available: false });
    });
  });

  describe('checkSubdomainAvailable', () => {
    it('should return availability status', async () => {
      mockReq.params = { subdomain: 'newstore' };
      vi.mocked(mockOrgService.checkSubdomainAvailable!).mockResolvedValue(true);

      await controller.checkSubdomainAvailable(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({ available: true });
    });
  });

  describe('create', () => {
    it('should create organization successfully', async () => {
      const mockCreated = { id: '1', name: 'New Org', slug: 'new-org' };
      mockReq.body = {
        name: 'New Org',
        slug: 'new-org',
        ownerId: 'user-1',
      };
      vi.mocked(mockOrgService.create!).mockResolvedValue(mockCreated as any);

      await controller.create(mockReq as Request, mockRes as Response);

      expect(mockOrgService.create).toHaveBeenCalledWith(
        { name: 'New Org', slug: 'new-org' },
        'user-1'
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreated);
    });

    it('should return 400 if ownerId missing', async () => {
      mockReq.body = { name: 'New Org', slug: 'new-org' };

      await controller.create(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Owner ID is required',
      });
    });

    it('should return 400 if name missing', async () => {
      mockReq.body = { slug: 'new-org', ownerId: 'user-1' };

      await controller.create(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Name and slug are required',
      });
    });

    it('should return 400 on validation error', async () => {
      mockReq.body = {
        name: 'New Org',
        slug: 'existing',
        ownerId: 'user-1',
      };
      vi.mocked(mockOrgService.create!).mockRejectedValue(
        new Error('El slug ya está en uso')
      );

      await controller.create(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'El slug ya está en uso',
      });
    });
  });

  describe('update', () => {
    it('should update organization successfully', async () => {
      const mockUpdated = { id: '1', name: 'Updated Org' };
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Updated Org' };
      vi.mocked(mockOrgService.update!).mockResolvedValue(mockUpdated as any);

      await controller.update(mockReq as Request, mockRes as Response);

      expect(mockOrgService.update).toHaveBeenCalledWith('1', { name: 'Updated Org' });
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should return 404 if organization not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Updated Org' };
      vi.mocked(mockOrgService.update!).mockResolvedValue(null);

      await controller.update(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      const mockUpdated = { id: '1', settings: { theme: 'dark' } };
      mockReq.params = { id: '1' };
      mockReq.body = { theme: 'dark' };
      vi.mocked(mockOrgService.updateSettings!).mockResolvedValue(mockUpdated as any);

      await controller.updateSettings(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should return 404 if organization not found', async () => {
      mockReq.params = { id: '999' };
      vi.mocked(mockOrgService.updateSettings!).mockResolvedValue(null);

      await controller.updateSettings(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('delete', () => {
    it('should delete organization successfully', async () => {
      mockReq.params = { id: '1' };
      vi.mocked(mockOrgService.delete!).mockResolvedValue(true);

      await controller.delete(mockReq as Request, mockRes as Response);

      expect(mockOrgService.delete).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Organization deleted successfully',
      });
    });

    it('should return 404 if not found', async () => {
      mockReq.params = { id: '999' };
      vi.mocked(mockOrgService.delete!).mockResolvedValue(false);

      await controller.delete(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 on validation error', async () => {
      mockReq.params = { id: '1' };
      vi.mocked(mockOrgService.delete!).mockRejectedValue(
        new Error('No se puede eliminar una organización con miembros activos')
      );

      await controller.delete(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
