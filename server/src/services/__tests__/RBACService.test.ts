import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RBACService } from '../RBACService';
import type { RBACRepository } from '../../repositories/RBACRepository';
import type { OrganizationMemberRepository } from '../../repositories/OrganizationMemberRepository';
import type { OrganizationModuleRepository } from '../../repositories/OrganizationModuleRepository';
import type { UserRepository } from '../../repositories/UserRepository';

describe('RBACService', () => {
  let service: RBACService;
  let mockRbacRepo: Partial<RBACRepository>;
  let mockMemberRepo: Partial<OrganizationMemberRepository>;
  let mockOrgModuleRepo: Partial<OrganizationModuleRepository>;
  let mockUserRepo: Partial<UserRepository>;

  // Availability fixture: module 'products' (m1) assigned+enabled for org-1,
  // submodule 'inventory' (s1) with grantable actions create (a1) / read (a2)
  const productsModule = { id: 'm1', name: 'products', displayName: 'Products', icon: null, isActive: true, sortOrder: 1 };
  const inventorySubmodule = { id: 's1', moduleId: 'm1', name: 'inventory', displayName: 'Inventory', description: null, isActive: true, sortOrder: 1 };
  const createAction = { id: 'a1', name: 'create', displayName: 'Create', description: null };
  const readAction = { id: 'a2', name: 'read', displayName: 'Read', description: null };

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
      findAllModulesRaw: vi.fn().mockResolvedValue([productsModule]),
      findAllSubmodules: vi.fn().mockResolvedValue([inventorySubmodule]),
      findAllActions: vi.fn().mockResolvedValue([createAction, readAction]),
      findPermissionsByRole: vi.fn().mockResolvedValue([]),
      setRolePermissions: vi.fn(),
      hasPermission: vi.fn(),
      countMembersByRole: vi.fn().mockResolvedValue(0),
    };

    mockMemberRepo = {
      findByUserAndOrganization: vi.fn(),
    };

    mockOrgModuleRepo = {
      findByOrganization: vi.fn().mockResolvedValue([
        { id: 'om1', organizationId: 'org-1', moduleId: 'm1', isEnabled: true, assignedBy: null, assignedAt: new Date() },
      ]),
      findOverridesByOrganization: vi.fn().mockResolvedValue([]),
      findAllSubmoduleActions: vi.fn().mockResolvedValue([
        { id: 'sa1', submoduleId: 's1', actionId: 'a1' },
        { id: 'sa2', submoduleId: 's1', actionId: 'a2' },
      ]),
    };

    mockUserRepo = {
      getUser: vi.fn().mockResolvedValue({ id: 'user-1', role: 'customer' } as any),
    };

    service = new RBACService(
      mockRbacRepo as RBACRepository,
      mockMemberRepo as OrganizationMemberRepository,
      mockOrgModuleRepo as OrganizationModuleRepository,
      mockUserRepo as UserRepository
    );
  });

  describe('hasPermission (V4)', () => {
    const userId = 'user-1';
    const organizationId = 'org-1';

    it('should return false if user is not a member (deny-by-default)', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue(null);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'create',
      });

      expect(result).toBe(false);
    });

    it('should bypass for platform_admin USERS (users.role)', async () => {
      vi.mocked(mockUserRepo.getUser!).mockResolvedValue({ id: userId, role: 'platform_admin' } as any);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'create',
      });

      expect(result).toBe(true);
      expect(mockMemberRepo.findByUserAndOrganization).not.toHaveBeenCalled();
    });

    it('should NOT bypass for an org role merely named platform_admin', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({ roleId: 'role-1' } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'platform_admin',
        isSystem: true,
        isActive: true,
        organizationId: null,
      } as any);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'create',
      });

      expect(result).toBe(false);
    });

    it('should resolve owner as all grantable actions (no grant rows needed)', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({ roleId: 'role-owner' } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-owner',
        name: 'owner',
        isSystem: true,
        isActive: true,
        organizationId: null,
      } as any);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'create',
        submodule: 'inventory',
      });

      expect(result).toBe(true);
      expect(mockRbacRepo.findPermissionsByRole).not.toHaveBeenCalled();
    });

    it('should allow a regular role with a module-wide grant on an available submodule', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({ roleId: 'role-1' } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'staff',
        isSystem: true,
        isActive: true,
        organizationId: null,
      } as any);
      vi.mocked(mockRbacRepo.findPermissionsByRole!).mockResolvedValue([
        { id: 'p1', roleId: 'role-1', moduleId: 'm1', submoduleId: null, actionId: 'a2' } as any,
      ]);

      await expect(
        service.hasPermission(userId, organizationId, { module: 'products', action: 'read' })
      ).resolves.toBe(true);
      await expect(
        service.hasPermission(userId, organizationId, { module: 'products', action: 'create' })
      ).resolves.toBe(false);
    });

    it('should deny when the module is unassigned even with a stale grant (V5)', async () => {
      vi.mocked(mockOrgModuleRepo.findByOrganization!).mockResolvedValue([]);
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({ roleId: 'role-1' } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'staff',
        isSystem: true,
        isActive: true,
        organizationId: null,
      } as any);
      vi.mocked(mockRbacRepo.findPermissionsByRole!).mockResolvedValue([
        { id: 'p1', roleId: 'role-1', moduleId: 'm1', submoduleId: null, actionId: 'a2' } as any,
      ]);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'read',
      });

      expect(result).toBe(false);
    });

    it('should deny for a disabled role', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({ roleId: 'role-1' } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'staff',
        isSystem: true,
        isActive: false,
        organizationId: null,
      } as any);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'read',
      });

      expect(result).toBe(false);
    });

    it('should deny for a cross-org role (V3 scope)', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({ roleId: 'role-1' } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'custom',
        isSystem: false,
        isActive: true,
        organizationId: 'other-org',
      } as any);

      const result = await service.hasPermission(userId, organizationId, {
        module: 'products',
        action: 'read',
      });

      expect(result).toBe(false);
    });
  });

  describe('getMyPermissions (O1)', () => {
    it('should return null when not a member', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue(null);

      const result = await service.getMyPermissions('user-1', 'org-1');

      expect(result).toBeNull();
    });

    it('should expand owner permissions across the available matrix', async () => {
      vi.mocked(mockMemberRepo.findByUserAndOrganization!).mockResolvedValue({ roleId: 'role-owner' } as any);
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-owner',
        name: 'owner',
        displayName: 'Owner',
        isSystem: true,
        isActive: true,
        organizationId: null,
      } as any);

      const result = await service.getMyPermissions('user-1', 'org-1');

      expect(result).not.toBeNull();
      expect(result!.isOwner).toBe(true);
      expect(result!.isAdmin).toBe(true);
      expect(result!.modules).toEqual(['products']);
      expect(result!.permissions).toEqual([
        'products:inventory:create',
        'products:inventory:read',
      ]);
    });
  });

  describe('getAvailableMatrix (O2)', () => {
    it('should only include assigned+enabled modules with grantable actions', async () => {
      const matrix = await service.getAvailableMatrix('org-1');

      expect(matrix.modules).toHaveLength(1);
      expect(matrix.modules[0].name).toBe('products');
      expect(matrix.modules[0].submodules[0].actions.map((a) => a.name)).toEqual(['create', 'read']);
    });

    it('should respect submodule overrides (disabled)', async () => {
      vi.mocked(mockOrgModuleRepo.findOverridesByOrganization!).mockResolvedValue([
        { id: 'ov1', organizationId: 'org-1', submoduleId: 's1', isEnabled: false } as any,
      ]);

      const matrix = await service.getAvailableMatrix('org-1');

      expect(matrix.modules[0].submodules).toHaveLength(0);
    });
  });

  describe('setRolePermissionsForOrg (O10/V2)', () => {
    const orgRole = {
      id: 'role-1',
      name: 'custom',
      isSystem: false,
      isActive: true,
      organizationId: 'org-1',
    };

    it('should reject grants outside the org available matrix', async () => {
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue(orgRole as any);

      await expect(
        service.setRolePermissionsForOrg('role-1', 'org-1', [
          { moduleId: 'm1', submoduleId: 's1', actionId: 'a-unknown' },
        ])
      ).rejects.toThrow(/no están disponibles/);
      expect(mockRbacRepo.setRolePermissions).not.toHaveBeenCalled();
    });

    it('should save valid grants and return the count', async () => {
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue(orgRole as any);

      const count = await service.setRolePermissionsForOrg('role-1', 'org-1', [
        { moduleId: 'm1', submoduleId: 's1', actionId: 'a1' },
        { moduleId: 'm1', submoduleId: null, actionId: 'a2' },
      ]);

      expect(count).toBe(2);
      expect(mockRbacRepo.setRolePermissions).toHaveBeenCalledWith('role-1', [
        { roleId: 'role-1', moduleId: 'm1', submoduleId: 's1', actionId: 'a1' },
        { roleId: 'role-1', moduleId: 'm1', submoduleId: null, actionId: 'a2' },
      ]);
    });

    it('should 404 cross-org roles', async () => {
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        ...orgRole,
        organizationId: 'other-org',
      } as any);

      await expect(
        service.setRolePermissionsForOrg('role-1', 'org-1', [])
      ).rejects.toThrow('Rol no encontrado');
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

  describe('deleteOrgRole (O8)', () => {
    it('should 409 when the role is referenced by members', async () => {
      vi.mocked(mockRbacRepo.findRoleById!).mockResolvedValue({
        id: 'role-1',
        name: 'custom',
        isSystem: false,
        organizationId: 'org-1',
      } as any);
      vi.mocked(mockRbacRepo.countMembersByRole!).mockResolvedValue(2);

      await expect(service.deleteOrgRole('role-1', 'org-1'))
        .rejects.toThrow(/asignado a miembros/);
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
