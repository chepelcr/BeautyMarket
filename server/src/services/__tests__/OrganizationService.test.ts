import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationService } from '../OrganizationService';
import type { OrganizationRepository } from '../../repositories/OrganizationRepository';
import type { OrganizationMemberRepository } from '../../repositories/OrganizationMemberRepository';
import type { RBACRepository } from '../../repositories/RBACRepository';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let mockOrgRepo: Partial<OrganizationRepository>;
  let mockMemberRepo: Partial<OrganizationMemberRepository>;
  let mockRbacRepo: Partial<RBACRepository>;

  beforeEach(() => {
    mockOrgRepo = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findBySubdomain: vi.fn(),
      findByCustomDomain: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      checkSlugAvailable: vi.fn(),
      checkSubdomainAvailable: vi.fn(),
      verifyDomain: vi.fn(),
    };

    mockMemberRepo = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      countByOrganization: vi.fn(),
    };

    mockRbacRepo = {
      findRoleByName: vi.fn(),
    };

    service = new OrganizationService(
      mockOrgRepo as OrganizationRepository,
      mockMemberRepo as OrganizationMemberRepository,
      mockRbacRepo as RBACRepository
    );
  });

  describe('getById', () => {
    it('should return organization when found', async () => {
      const mockOrg = { id: '1', name: 'Test Org', slug: 'test-org' };
      vi.mocked(mockOrgRepo.findById!).mockResolvedValue(mockOrg as any);

      const result = await service.getById('1');

      expect(result).toEqual(mockOrg);
      expect(mockOrgRepo.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when not found', async () => {
      vi.mocked(mockOrgRepo.findById!).mockResolvedValue(null);

      const result = await service.getById('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const mockOrgData = {
      name: 'New Org',
      slug: 'new-org',
      subdomain: 'new-org',
    };
    const ownerId = 'user-1';

    it('should create organization and add owner as member', async () => {
      const mockCreatedOrg = { id: 'org-1', ...mockOrgData };
      const mockOwnerRole = { id: 'role-1', name: 'owner' };

      vi.mocked(mockOrgRepo.checkSlugAvailable!).mockResolvedValue(true);
      vi.mocked(mockOrgRepo.checkSubdomainAvailable!).mockResolvedValue(true);
      vi.mocked(mockOrgRepo.create!).mockResolvedValue(mockCreatedOrg as any);
      vi.mocked(mockRbacRepo.findRoleByName!).mockResolvedValue(mockOwnerRole as any);
      vi.mocked(mockMemberRepo.create!).mockResolvedValue({} as any);

      const result = await service.create(mockOrgData as any, ownerId);

      expect(result).toEqual(mockCreatedOrg);
      expect(mockOrgRepo.create).toHaveBeenCalledWith(mockOrgData);
      expect(mockMemberRepo.create).toHaveBeenCalledWith({
        organizationId: 'org-1',
        userId: ownerId,
        roleId: 'role-1',
        isDefault: true,
        invitedBy: ownerId,
      });
    });

    it('should throw error if slug is not available', async () => {
      vi.mocked(mockOrgRepo.checkSlugAvailable!).mockResolvedValue(false);

      await expect(service.create(mockOrgData as any, ownerId))
        .rejects.toThrow('El slug ya está en uso');
    });

    it('should throw error if subdomain is not available', async () => {
      vi.mocked(mockOrgRepo.checkSlugAvailable!).mockResolvedValue(true);
      vi.mocked(mockOrgRepo.checkSubdomainAvailable!).mockResolvedValue(false);

      await expect(service.create(mockOrgData as any, ownerId))
        .rejects.toThrow('El subdominio ya está en uso');
    });

    it('should throw error if owner role not found', async () => {
      vi.mocked(mockOrgRepo.checkSlugAvailable!).mockResolvedValue(true);
      vi.mocked(mockOrgRepo.checkSubdomainAvailable!).mockResolvedValue(true);
      vi.mocked(mockOrgRepo.create!).mockResolvedValue({ id: 'org-1' } as any);
      vi.mocked(mockRbacRepo.findRoleByName!).mockResolvedValue(null);

      await expect(service.create(mockOrgData as any, ownerId))
        .rejects.toThrow("Role 'owner' not found");
    });
  });

  describe('delete', () => {
    it('should delete organization with only one member', async () => {
      vi.mocked(mockMemberRepo.countByOrganization!).mockResolvedValue(1);
      vi.mocked(mockOrgRepo.delete!).mockResolvedValue(true);

      const result = await service.delete('org-1');

      expect(result).toBe(true);
      expect(mockOrgRepo.delete).toHaveBeenCalledWith('org-1');
    });

    it('should throw error if organization has multiple members', async () => {
      vi.mocked(mockMemberRepo.countByOrganization!).mockResolvedValue(5);

      await expect(service.delete('org-1'))
        .rejects.toThrow('No se puede eliminar una organización con miembros activos');
    });
  });

  describe('checkSubdomainAvailable', () => {
    it('should return false for reserved subdomains', async () => {
      const result = await service.checkSubdomainAvailable('www');
      expect(result).toBe(false);
      expect(mockOrgRepo.checkSubdomainAvailable).not.toHaveBeenCalled();
    });

    it('should check repository for non-reserved subdomains', async () => {
      vi.mocked(mockOrgRepo.checkSubdomainAvailable!).mockResolvedValue(true);

      const result = await service.checkSubdomainAvailable('mystore');

      expect(result).toBe(true);
      expect(mockOrgRepo.checkSubdomainAvailable).toHaveBeenCalledWith('mystore', undefined);
    });
  });
});
