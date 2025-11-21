import type { Role, InsertRole, Module, Action, RolePermission, InsertRolePermission } from "../entities";
import type { RBACRepository, ModuleWithSubmodules } from "../repositories/RBACRepository";
import type { OrganizationMemberRepository } from "../repositories/OrganizationMemberRepository";

export interface PermissionCheck {
  module: string;
  action: string;
  submodule?: string;
}

export interface IRBACService {
  // Role management
  getRoleById(id: string): Promise<Role | null>;
  getRolesByOrganization(organizationId: string | null): Promise<Role[]>;
  getSystemRoles(): Promise<Role[]>;
  createRole(data: InsertRole): Promise<Role>;
  updateRole(id: string, data: Partial<InsertRole>): Promise<Role | null>;
  deleteRole(id: string): Promise<boolean>;

  // Module/Action retrieval
  getAllModules(): Promise<ModuleWithSubmodules[]>;
  getAllActions(): Promise<Action[]>;

  // Permission management
  getRolePermissions(roleId: string): Promise<RolePermission[]>;
  setRolePermissions(roleId: string, permissions: InsertRolePermission[]): Promise<void>;

  // Permission checking
  hasPermission(userId: string, organizationId: string, check: PermissionCheck): Promise<boolean>;
  hasAnyPermission(userId: string, organizationId: string, checks: PermissionCheck[]): Promise<boolean>;
  hasAllPermissions(userId: string, organizationId: string, checks: PermissionCheck[]): Promise<boolean>;
  getUserRole(userId: string, organizationId: string): Promise<Role | null>;
}

export class RBACService implements IRBACService {
  constructor(
    private rbacRepo: RBACRepository,
    private memberRepo: OrganizationMemberRepository
  ) {}

  // Role management
  async getRoleById(id: string): Promise<Role | null> {
    return this.rbacRepo.findRoleById(id);
  }

  async getRolesByOrganization(organizationId: string | null): Promise<Role[]> {
    return this.rbacRepo.findRolesByOrganization(organizationId);
  }

  async getSystemRoles(): Promise<Role[]> {
    return this.rbacRepo.findSystemRoles();
  }

  async createRole(data: InsertRole): Promise<Role> {
    // Check if role name already exists for this organization
    const existing = await this.rbacRepo.findRoleByName(data.name, data.organizationId || null);
    if (existing) {
      throw new Error("Ya existe un rol con este nombre");
    }

    return this.rbacRepo.createRole(data);
  }

  async updateRole(id: string, data: Partial<InsertRole>): Promise<Role | null> {
    const role = await this.rbacRepo.findRoleById(id);
    if (!role) return null;

    // Don't allow modifying system roles
    if (role.isSystem && (data.name || data.organizationId !== undefined)) {
      throw new Error("No se puede modificar un rol del sistema");
    }

    return this.rbacRepo.updateRole(id, data);
  }

  async deleteRole(id: string): Promise<boolean> {
    const role = await this.rbacRepo.findRoleById(id);
    if (!role) return false;

    if (role.isSystem) {
      throw new Error("No se puede eliminar un rol del sistema");
    }

    return this.rbacRepo.deleteRole(id);
  }

  // Module/Action retrieval
  async getAllModules(): Promise<ModuleWithSubmodules[]> {
    return this.rbacRepo.findAllModules();
  }

  async getAllActions(): Promise<Action[]> {
    return this.rbacRepo.findAllActions();
  }

  // Permission management
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return this.rbacRepo.findPermissionsByRole(roleId);
  }

  async setRolePermissions(roleId: string, permissions: InsertRolePermission[]): Promise<void> {
    const role = await this.rbacRepo.findRoleById(roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    // Don't allow modifying system role permissions directly
    // (they should only be modified via migration/seed)
    if (role.isSystem) {
      throw new Error("No se pueden modificar los permisos de un rol del sistema");
    }

    await this.rbacRepo.setRolePermissions(roleId, permissions);
  }

  // Permission checking
  async getUserRole(userId: string, organizationId: string): Promise<Role | null> {
    const membership = await this.memberRepo.findByUserAndOrganization(userId, organizationId);
    if (!membership) return null;

    return this.rbacRepo.findRoleById(membership.roleId);
  }

  async hasPermission(userId: string, organizationId: string, check: PermissionCheck): Promise<boolean> {
    const membership = await this.memberRepo.findByUserAndOrganization(userId, organizationId);
    if (!membership) return false;

    // Check if user has platform_admin role (full access)
    const role = await this.rbacRepo.findRoleById(membership.roleId);
    if (role?.name === "platform_admin") return true;

    return this.rbacRepo.hasPermission(
      membership.roleId,
      check.module,
      check.action,
      check.submodule
    );
  }

  async hasAnyPermission(userId: string, organizationId: string, checks: PermissionCheck[]): Promise<boolean> {
    for (const check of checks) {
      if (await this.hasPermission(userId, organizationId, check)) {
        return true;
      }
    }
    return false;
  }

  async hasAllPermissions(userId: string, organizationId: string, checks: PermissionCheck[]): Promise<boolean> {
    for (const check of checks) {
      if (!(await this.hasPermission(userId, organizationId, check))) {
        return false;
      }
    }
    return true;
  }

  // Helper to check if user is organization owner
  async isOrganizationOwner(userId: string, organizationId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId);
    return role?.name === "owner";
  }

  // Helper to check if user is organization admin or higher
  async isOrganizationAdmin(userId: string, organizationId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId);
    return role?.name === "owner" || role?.name === "admin";
  }
}
