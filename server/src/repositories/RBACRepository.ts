import { eq, and, isNull, or, sql } from "drizzle-orm";
import { db } from "../config/database";
import {
  roles,
  modules,
  submodules,
  actions,
  rolePermissions,
  organizationMembers,
  type Role,
  type InsertRole,
  type Module,
  type InsertModule,
  type Submodule,
  type InsertSubmodule,
  type Action,
  type InsertAction,
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
  findAllModulesRaw(includeInactive?: boolean): Promise<Module[]>;
  findModuleById(id: string): Promise<Module | null>;
  findModuleByName(name: string): Promise<Module | null>;
  createModule(data: InsertModule): Promise<Module>;
  updateModule(id: string, data: Partial<InsertModule>): Promise<Module | null>;
  deleteModule(id: string): Promise<boolean>;

  // Submodules
  findAllSubmodules(includeInactive?: boolean): Promise<Submodule[]>;
  findSubmoduleById(id: string): Promise<Submodule | null>;
  findSubmodulesByModule(moduleId: string): Promise<Submodule[]>;
  createSubmodule(data: InsertSubmodule): Promise<Submodule>;
  updateSubmodule(id: string, data: Partial<InsertSubmodule>): Promise<Submodule | null>;
  deleteSubmodule(id: string): Promise<boolean>;

  // Actions
  findAllActions(): Promise<Action[]>;
  findActionById(id: string): Promise<Action | null>;
  findActionByName(name: string): Promise<Action | null>;
  createAction(data: InsertAction): Promise<Action>;
  updateAction(id: string, data: Partial<InsertAction>): Promise<Action | null>;
  deleteAction(id: string): Promise<boolean>;

  // Permissions
  findPermissionsByRole(roleId: string): Promise<RolePermission[]>;
  setRolePermissions(roleId: string, permissions: InsertRolePermission[]): Promise<void>;
  hasPermission(roleId: string, moduleName: string, actionName: string, submoduleName?: string): Promise<boolean>;

  // Reference counts (409 guards for catalog/role deletes)
  countMembersByRole(roleId: string): Promise<number>;
  countPermissionsByModule(moduleId: string): Promise<number>;
  countPermissionsBySubmodule(submoduleId: string): Promise<number>;
  countPermissionsByAction(actionId: string): Promise<number>;
  countPermissionsBySubmoduleAndAction(submoduleId: string, actionId: string): Promise<number>;
}

export class RBACRepository implements IRBACRepository {
  // Roles
  async findRoleById(id: string): Promise<Role | null> {
    const result = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findRolesByOrganization(organizationId: string | null): Promise<Role[]> {
    if (organizationId) {
      // Return org-specific roles + system roles
      return db
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
      return db
        .select()
        .from(roles)
        .where(isNull(roles.organizationId))
        .orderBy(roles.name);
    }
  }

  async findSystemRoles(): Promise<Role[]> {
    return db
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

    const result = await db
      .select()
      .from(roles)
      .where(and(...conditions))
      .limit(1);
    return result[0] || null;
  }

  async createRole(data: InsertRole): Promise<Role> {
    const result = await db
      .insert(roles)
      .values(data)
      .returning();
    return result[0];
  }

  async updateRole(id: string, data: Partial<InsertRole>): Promise<Role | null> {
    const result = await db
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

    const result = await db
      .delete(roles)
      .where(eq(roles.id, id))
      .returning();
    return result.length > 0;
  }

  // Modules
  async findAllModules(): Promise<ModuleWithSubmodules[]> {
    const allModules = await db
      .select()
      .from(modules)
      .where(eq(modules.isActive, true))
      .orderBy(modules.sortOrder);

    const allSubmodules = await db
      .select()
      .from(submodules)
      .where(eq(submodules.isActive, true))
      .orderBy(submodules.sortOrder);

    return allModules.map(mod => ({
      ...mod,
      submodules: allSubmodules.filter(sub => sub.moduleId === mod.id)
    }));
  }

  async findAllModulesRaw(includeInactive = false): Promise<Module[]> {
    if (includeInactive) {
      return db.select().from(modules).orderBy(modules.sortOrder);
    }
    return db
      .select()
      .from(modules)
      .where(eq(modules.isActive, true))
      .orderBy(modules.sortOrder);
  }

  async findModuleById(id: string): Promise<Module | null> {
    const result = await db
      .select()
      .from(modules)
      .where(eq(modules.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findModuleByName(name: string): Promise<Module | null> {
    const result = await db
      .select()
      .from(modules)
      .where(eq(modules.name, name))
      .limit(1);
    return result[0] || null;
  }

  async createModule(data: InsertModule): Promise<Module> {
    const result = await db.insert(modules).values(data).returning();
    return result[0];
  }

  async updateModule(id: string, data: Partial<InsertModule>): Promise<Module | null> {
    const result = await db
      .update(modules)
      .set(data)
      .where(eq(modules.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteModule(id: string): Promise<boolean> {
    const result = await db
      .delete(modules)
      .where(eq(modules.id, id))
      .returning();
    return result.length > 0;
  }

  // Submodules
  async findAllSubmodules(includeInactive = false): Promise<Submodule[]> {
    if (includeInactive) {
      return db.select().from(submodules).orderBy(submodules.sortOrder);
    }
    return db
      .select()
      .from(submodules)
      .where(eq(submodules.isActive, true))
      .orderBy(submodules.sortOrder);
  }

  async findSubmoduleById(id: string): Promise<Submodule | null> {
    const result = await db
      .select()
      .from(submodules)
      .where(eq(submodules.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findSubmodulesByModule(moduleId: string): Promise<Submodule[]> {
    return db
      .select()
      .from(submodules)
      .where(eq(submodules.moduleId, moduleId))
      .orderBy(submodules.sortOrder);
  }

  async createSubmodule(data: InsertSubmodule): Promise<Submodule> {
    const result = await db.insert(submodules).values(data).returning();
    return result[0];
  }

  async updateSubmodule(id: string, data: Partial<InsertSubmodule>): Promise<Submodule | null> {
    const result = await db
      .update(submodules)
      .set(data)
      .where(eq(submodules.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteSubmodule(id: string): Promise<boolean> {
    const result = await db
      .delete(submodules)
      .where(eq(submodules.id, id))
      .returning();
    return result.length > 0;
  }

  // Actions
  async findAllActions(): Promise<Action[]> {
    return db
      .select()
      .from(actions)
      .orderBy(actions.name);
  }

  async findActionById(id: string): Promise<Action | null> {
    const result = await db
      .select()
      .from(actions)
      .where(eq(actions.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findActionByName(name: string): Promise<Action | null> {
    const result = await db
      .select()
      .from(actions)
      .where(eq(actions.name, name))
      .limit(1);
    return result[0] || null;
  }

  async createAction(data: InsertAction): Promise<Action> {
    const result = await db.insert(actions).values(data).returning();
    return result[0];
  }

  async updateAction(id: string, data: Partial<InsertAction>): Promise<Action | null> {
    const result = await db
      .update(actions)
      .set(data)
      .where(eq(actions.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteAction(id: string): Promise<boolean> {
    const result = await db
      .delete(actions)
      .where(eq(actions.id, id))
      .returning();
    return result.length > 0;
  }

  // Reference counts (409 guards for catalog/role deletes)
  async countMembersByRole(roleId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMembers)
      .where(eq(organizationMembers.roleId, roleId));
    return result[0]?.count ?? 0;
  }

  async countPermissionsByModule(moduleId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rolePermissions)
      .where(eq(rolePermissions.moduleId, moduleId));
    return result[0]?.count ?? 0;
  }

  async countPermissionsBySubmodule(submoduleId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rolePermissions)
      .where(eq(rolePermissions.submoduleId, submoduleId));
    return result[0]?.count ?? 0;
  }

  async countPermissionsByAction(actionId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rolePermissions)
      .where(eq(rolePermissions.actionId, actionId));
    return result[0]?.count ?? 0;
  }

  async countPermissionsBySubmoduleAndAction(submoduleId: string, actionId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.submoduleId, submoduleId),
          eq(rolePermissions.actionId, actionId)
        )
      );
    return result[0]?.count ?? 0;
  }

  // Permissions
  async findPermissionsByRole(roleId: string): Promise<RolePermission[]> {
    return db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
  }

  async setRolePermissions(roleId: string, permissions: InsertRolePermission[]): Promise<void> {
    // Delete existing permissions
    await db
      .delete(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));

    // Insert new permissions
    if (permissions.length > 0) {
      await db
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
    let result = await db
      .select()
      .from(rolePermissions)
      .where(and(...conditions))
      .limit(1);

    // If submodule specified, also check submodule-specific or module-wide permission
    if (submoduleName && result.length === 0) {
      const submodule = await db
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
        result = await db
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
