import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RBACService } from '../RBACService';
import type { RBACRepository } from '../../repositories/RBACRepository';
import type { OrganizationMemberRepository } from '../../repositories/OrganizationMemberRepository';

describe('RBACService', () => {
  let service: RBACService;
  let mockRbacRepo: Partial<RBACRepository>;
  let mockMemberRepo: Partial<OrganizationMemberRepository>;

  beforeEach(() => {
    mockRbacRepo = {
      findRoleById: vi.fn(),
      findRolesByOrganization: vi.fn(),
      findSystemRoles: vi.fn(),
      findRoleByName: vi.fn(),
      createRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      findAllModules: vi.fn(),
      findAllActions: vi.fn(),
      findPermissionsByRole: vi.fn(),
      setRolePermissions: vi.fn(),
      hasPermission: vi.fn(),
    };

    mockMemberRepo = {
      findByUserAndOrganization: vi.fn(),
    };

    service = new RBACService(
      mockRbacRepo as RBACRepository,
      mockMemberRepo as OrganizationMemberRepository
    );
  });

  describe('hasPermission', () => {
    const userId = 'user-1';
    const organizationId = 'org-1';

    it('should return false if user is not a member', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue(null);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'create',
      });

      expect(result).toBe(false);
    });

    it('should return true for platform_admin role', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({
        roleId: 'role-1',
      } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'platform_admin',
      } as any);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'create',
      });

      expect(result).toBe(true);
      expect(mockRbacRepo.hasPermission).not.toHaveBeenCalled();
    });

    it('should check repository for regular roles', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({
        roleId: 'role-1',
      } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'admin',
      } as any);
      vi.mocked(mockRbacRepo.hasPermission!).mockResolvedValue(true);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'create',
      });

      expect(result).toBe(true);
      expect(mockRbacRepo.hasPermission).toHaveBeenCalledWith(
        'role-1',
        'products',
        'create',
        undefined
      );
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the permissions', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({
        roleId: 'role-1',
      } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'staff',
      } as any);
      vi.mocked(mockRbacRepo.hasPermission!)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const result = await service.hasAnyPermission('user-1', 'org-1', [
        { module: 'products', action: 'delete' },
        { module: 'products', action: 'read' },
      ]);

      expect(result).toBe(true);
    });

    it('should return false if user has none of the permissions', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({
        roleId: 'role-1',
      } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'staff',
      } as any);
      vi.mocked(mockRbacRepo.hasPermission!).mockResolvedValue(false);

      const result = await service.hasAnyPermission('user-1', 'org-1', [
        { module: 'products', action: 'delete' },
        { module: 'products', action: 'create' },
      ]);

      expect(result).toBe(false);
    });
  });

  describe('createRole', () => {
    it('should create role if name is unique', async () => {
      vi.mocked(mockRbacRepo.findRoleByName!).mockResolvedValue(null);
      vi.mocked(mockRbacRepo.createRole!).mockResolvedValue({
        id: 'role-1',
        name: 'custom-role',
      } as any);

      const result = await service.createRole({
        name: 'custom-role',
        organizationId: 'org-1',
      } as any);

      expect(result.name).toBe('custom-role');
    });

    it('should throw error if role name exists', async () => {
      vi.mocked(mockRbacRepo.findRoleByName!).mockResolvedValue({
        id: 'existing',
        name: 'custom-role',
      } as any);

      await expect(service.createRole({
        name: 'custom-role',
        organizationId: 'org-1',
      } as any)).rejects.toThrow('Ya existe un rol con este nombre');
    });
  });

  describe('deleteRole', () => {
    it('should not allow deleting system roles', async () => {
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'owner',
        isSystem: true,
      } as any);

      await expect(service.deleteRole('role-1'))
        .rejects.toThrow('No se puede eliminar un rol del sistema');
    });

    it('should delete non-system roles', async () => {
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'custom',
        isSystem: false,
      } as any);
      vi.mocked(mockRbacRepo.deleteRole!).mockResolvedValue(true);

      const result = await service.deleteRole('role-1');

      expect(result).toBe(true);
    });
  });

  describe('isOrganizationOwner', () => {
    it('should return true for owner role', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({
        roleId: 'role-1',
      } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'owner',
      } as any);

      const result = await service.isOrganizationOwner('user-1', 'org-1');

      expect(result).toBe(true);
    });

    it('should return false for non-owner roles', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({
        roleId: 'role-1',
      } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'admin',
      } as any);

      const result = await service.isOrganizationOwner('user-1', 'org-1');

      expect(result).toBe(false);
    });
  });
});
