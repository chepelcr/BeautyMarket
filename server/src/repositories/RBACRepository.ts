import { eq, and, isNull, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  roles,
  modules,
  submodules,
  actions,
  rolePermissions,
  type Role,
  type InsertRole,
  type Module,
  type Submodule,
  type Action,
  type RolePermission,
  type InsertRolePermission
} from "../entities";

export interface ModuleWithSubmodules extends Module {
  submodules: Submodule[];
}

export interface IRBACRepository {
  // Roles
  findRoleById(id: string): Promise<Role | null>;
  findRolesByOrganization(organizationId: string | null): Promise<Role[]>;
  findSystemRoles(): Promise<Role[]>;
  findRoleByName(name: string, organizationId: string | null): Promise<Role | null>;
  createRole(data: InsertRole): Promise<Role>;
  updateRole(id: string, data: Partial<InsertRole>): Promise<Role | null>;
  deleteRole(id: string): Promise<boolean>;

  // Modules
  findAllModules(): Promise<ModuleWithSubmodules[]>;
  findModuleById(id: string): Promise<Module | null>;
  findModuleByName(name: string): Promise<Module | null>;

  // Actions
  findAllActions(): Promise<Action[]>;
  findActionById(id: string): Promise<Action | null>;
  findActionByName(name: string): Promise<Action | null>;

  // Permissions
  findPermissionsByRole(roleId: string): Promise<RolePermission[]>;
  setRolePermissions(roleId: string, permissions: InsertRolePermission[]): Promise<void>;
  hasPermission(roleId: string, moduleName: string, actionName: string, submoduleName?: string): Promise<boolean>;
}

export class RBACRepository implements IRBACRepository {
  constructor(private db: PostgresJsDatabase) {}

  // Roles
  async findRoleById(id: string): Promise<Role | null> {
    const result = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findRolesByOrganization(organizationId: string | null): Promise<Role[]> {
    if (organizationId) {
      // Return org-specific roles + system roles
      return this.db
        .select()
        .from(roles)
        .where(
          or(
            eq(roles.organizationId, organizationId),
            isNull(roles.organizationId)
          )
        )
        .orderBy(roles.name);
    } else {
      // Return only system roles
      return this.db
        .select()
        .from(roles)
        .where(isNull(roles.organizationId))
        .orderBy(roles.name);
    }
  }

  async findSystemRoles(): Promise<Role[]> {
    return this.db
      .select()
      .from(roles)
      .where(eq(roles.isSystem, true))
      .orderBy(roles.name);
  }

  async findRoleByName(name: string, organizationId: string | null): Promise<Role | null> {
    const conditions = [eq(roles.name, name)];
    if (organizationId) {
      conditions.push(
        or(
          eq(roles.organizationId, organizationId),
          isNull(roles.organizationId)
        )!
      );
    } else {
      conditions.push(isNull(roles.organizationId));
    }

    const result = await this.db
      .select()
      .from(roles)
      .where(and(...conditions))
      .limit(1);
    return result[0] || null;
  }

  async createRole(data: InsertRole): Promise<Role> {
    const result = await this.db
      .insert(roles)
      .values(data)
      .returning();
    return result[0];
  }

  async updateRole(id: string, data: Partial<InsertRole>): Promise<Role | null> {
    const result = await this.db
      .update(roles)
      .set(data)
      .where(eq(roles.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteRole(id: string): Promise<boolean> {
    // Don't allow deleting system roles
    const role = await this.findRoleById(id);
    if (role?.isSystem) return false;

    const result = await this.db
      .delete(roles)
      .where(eq(roles.id, id))
      .returning();
    return result.length > 0;
  }

  // Modules
  async findAllModules(): Promise<ModuleWithSubmodules[]> {
    const allModules = await this.db
      .select()
      .from(modules)
      .where(eq(modules.isActive, true))
      .orderBy(modules.sortOrder);

    const allSubmodules = await this.db
      .select()
      .from(submodules)
      .where(eq(submodules.isActive, true))
      .orderBy(submodules.sortOrder);

    return allModules.map(mod => ({
      ...mod,
      submodules: allSubmodules.filter(sub => sub.moduleId === mod.id)
    }));
  }

  async findModuleById(id: string): Promise<Module | null> {
    const result = await this.db
      .select()
      .from(modules)
      .where(eq(modules.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findModuleByName(name: string): Promise<Module | null> {
    const result = await this.db
      .select()
      .from(modules)
      .where(eq(modules.name, name))
      .limit(1);
    return result[0] || null;
  }

  // Actions
  async findAllActions(): Promise<Action[]> {
    return this.db
      .select()
      .from(actions)
      .orderBy(actions.name);
  }

  async findActionById(id: string): Promise<Action | null> {
    const result = await this.db
      .select()
      .from(actions)
      .where(eq(actions.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findActionByName(name: string): Promise<Action | null> {
    const result = await this.db
      .select()
      .from(actions)
      .where(eq(actions.name, name))
      .limit(1);
    return result[0] || null;
  }

  // Permissions
  async findPermissionsByRole(roleId: string): Promise<RolePermission[]> {
    return this.db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
  }

  async setRolePermissions(roleId: string, permissions: InsertRolePermission[]): Promise<void> {
    // Delete existing permissions
    await this.db
      .delete(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));

    // Insert new permissions
    if (permissions.length > 0) {
      await this.db
        .insert(rolePermissions)
        .values(permissions);
    }
  }

  async hasPermission(
    roleId: string,
    moduleName: string,
    actionName: string,
    submoduleName?: string
  ): Promise<boolean> {
    // Get module and action IDs
    const module = await this.findModuleByName(moduleName);
    const action = await this.findActionByName(actionName);

    if (!module || !action) return false;

    // Build query conditions
    const conditions = [
      eq(rolePermissions.roleId, roleId),
      eq(rolePermissions.moduleId, module.id),
      eq(rolePermissions.actionId, action.id)
    ];

    // Check for permission
    let result = await this.db
      .select()
      .from(rolePermissions)
      .where(and(...conditions))
      .limit(1);

    // If submodule specified, also check submodule-specific or module-wide permission
    if (submoduleName && result.length === 0) {
      const submodule = await this.db
        .select()
        .from(submodules)
        .where(
          and(
            eq(submodules.moduleId, module.id),
            eq(submodules.name, submoduleName)
          )
        )
        .limit(1);

      if (submodule[0]) {
        result = await this.db
          .select()
          .from(rolePermissions)
          .where(
            and(
              eq(rolePermissions.roleId, roleId),
              eq(rolePermissions.moduleId, module.id),
              eq(rolePermissions.actionId, action.id),
              or(
                isNull(rolePermissions.submoduleId),
                eq(rolePermissions.submoduleId, submodule[0].id)
              )
            )
          )
          .limit(1);
      }
    }

    return result.length > 0;
  }
}
