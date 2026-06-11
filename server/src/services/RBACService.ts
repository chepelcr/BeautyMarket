import type {
  Role,
  InsertRole,
  Module,
  Submodule,
  Action,
  RolePermission,
  InsertRolePermission,
} from "../entities";
import type { RBACRepository, ModuleWithSubmodules } from "../repositories/RBACRepository";
import type { OrganizationMemberRepository } from "../repositories/OrganizationMemberRepository";
import type { OrganizationModuleRepository } from "../repositories/OrganizationModuleRepository";
import type { UserRepository } from "../repositories/UserRepository";
import { HttpError } from "../utils/HttpError";

export interface PermissionCheck {
  module: string;
  action: string;
  submodule?: string;
}

// Permission grant row (request + response) — see docs/roadmap/rbac_express_contract.md §2
export interface PermissionGrantDto {
  moduleId: string;
  submoduleId: string | null; // null = module-wide grant (all submodules of the module)
  actionId: string;
}

// Available matrix (org-scoped, already intersected with the org's assignment)
export interface AvailableMatrixDto {
  modules: Array<{
    id: string;
    name: string;
    displayName: string;
    icon: string | null;
    sortOrder: number;
    submodules: Array<{
      id: string;
      name: string;
      displayName: string;
      sortOrder: number;
      actions: Array<{ id: string; name: string; displayName: string }>;
    }>;
  }>;
}

// My-permissions (FE nav/action gating)
export interface MyPermissionsDto {
  role: { id: string; name: string; displayName: string; isSystem: boolean; isActive: boolean };
  isOwner: boolean;
  isAdmin: boolean;
  modules: string[]; // module names available AND reachable by this role (nav gating)
  permissions: string[]; // flattened effective grants, format "module:submodule:action"
}

/**
 * V1 — Effective availability (single definition, reused everywhere):
 * submoduleAvailable(org, sub) = module.isActive
 *   AND organization_modules(org, module).is_enabled
 *   AND COALESCE(organization_submodules(org, sub).is_enabled, true)
 * (inactive submodules are additionally excluded — they are filtered out of
 * the platform catalog the same way inactive modules are).
 */
export function isSubmoduleAvailable(
  moduleIsActive: boolean,
  submoduleIsActive: boolean,
  orgModuleEnabled: boolean | undefined,
  submoduleOverride: boolean | undefined
): boolean {
  return moduleIsActive && submoduleIsActive && orgModuleEnabled === true && (submoduleOverride ?? true);
}

/**
 * V3 — Same-org role rule (O11 + MembershipService.addMember/updateMemberRole
 * + InvitationService role selection): the assignable roleId must satisfy
 * role.organizationId === orgId OR (role.isSystem AND organizationId IS NULL),
 * AND role.isActive, AND role.name !== 'platform_admin'.
 */
export function assertAssignableRole(role: Role | null, organizationId: string): asserts role is Role {
  if (!role) {
    throw new HttpError(400, "Rol no encontrado");
  }
  const sameOrg = role.organizationId === organizationId;
  const systemRole = role.isSystem && role.organizationId === null;
  if (!sameOrg && !systemRole) {
    throw new HttpError(400, "El rol no pertenece a esta organización");
  }
  if (!role.isActive) {
    throw new HttpError(400, "El rol está desactivado");
  }
  if (role.name === "platform_admin") {
    throw new HttpError(400, "El rol platform_admin no es asignable a organizaciones");
  }
}

// Internal availability structure shared by O1/O2/V2/V4
interface AvailabilityEntry {
  module: Module;
  submodules: Array<{ submodule: Submodule; actions: Action[] }>;
}

interface CacheEntry<T> {
  at: number;
  value: T;
}

const CACHE_TTL_MS = Number(process.env.RBAC_CACHE_TTL_MS || 60_000);

export interface IRBACService {
  // Role management
  getRoleById(id: string): Promise<Role | null>;
  getRolesByOrganization(organizationId: string | null): Promise<Role[]>;
  getSystemRoles(): Promise<Role[]>;
  getRoleForOrg(id: string, organizationId: string): Promise<Role | null>;
  createRole(data: InsertRole): Promise<Role>;
  createOrgRole(organizationId: string, data: { name: string; displayName?: string; description?: string }): Promise<Role>;
  updateRole(id: string, data: Partial<InsertRole>): Promise<Role | null>;
  updateOrgRole(id: string, organizationId: string, data: Partial<Pick<InsertRole, "name" | "displayName" | "description" | "isActive">>): Promise<Role | null>;
  deleteRole(id: string): Promise<boolean>;
  deleteOrgRole(id: string, organizationId: string): Promise<boolean>;

  // Module/Action retrieval
  getAllModules(): Promise<ModuleWithSubmodules[]>;
  getAllActions(): Promise<Action[]>;

  // Org-scoped availability (V1)
  getAvailableMatrix(organizationId: string): Promise<AvailableMatrixDto>;
  getMyPermissions(userId: string, organizationId: string): Promise<MyPermissionsDto | null>;

  // Permission management
  getRolePermissions(roleId: string): Promise<RolePermission[]>;
  getRolePermissionsForOrg(roleId: string, organizationId: string): Promise<PermissionGrantDto[] | null>;
  setRolePermissions(roleId: string, permissions: InsertRolePermission[]): Promise<void>;
  setRolePermissionsForOrg(roleId: string, organizationId: string, grants: PermissionGrantDto[]): Promise<number>;

  // Permission checking (V4)
  hasPermission(userId: string, organizationId: string, check: PermissionCheck): Promise<boolean>;
  hasAnyPermission(userId: string, organizationId: string, checks: PermissionCheck[]): Promise<boolean>;
  hasAllPermissions(userId: string, organizationId: string, checks: PermissionCheck[]): Promise<boolean>;
  getUserRole(userId: string, organizationId: string): Promise<Role | null>;
  isMember(userId: string, organizationId: string): Promise<boolean>;

  // Cache busting (V8) — called on O10/P3/P4/P18 writes
  invalidatePermissionCache(organizationId?: string): void;
}

export class RBACService implements IRBACService {
  // V8 — per-request resolution + optional 60s in-process cache
  private matrixCache = new Map<string, CacheEntry<AvailabilityEntry[]>>();
  private permissionCache = new Map<string, CacheEntry<Set<string>>>();

  constructor(
    private rbacRepo: RBACRepository,
    private memberRepo: OrganizationMemberRepository,
    private orgModuleRepo: OrganizationModuleRepository,
    private userRepo: UserRepository
  ) {}

  // =====================================================================
  // Role management
  // =====================================================================
  async getRoleById(id: string): Promise<Role | null> {
    return this.rbacRepo.findRoleById(id);
  }

  async getRolesByOrganization(organizationId: string | null): Promise<Role[]> {
    const roles = await this.rbacRepo.findRolesByOrganization(organizationId);
    // platform_admin is never org-assignable — hide it from org-facing lists (V6)
    return roles.filter((r) => r.name !== "platform_admin");
  }

  async getSystemRoles(): Promise<Role[]> {
    const roles = await this.rbacRepo.findSystemRoles();
    // O3 — platform_admin excluded: it is never org-assignable
    return roles.filter((r) => r.name !== "platform_admin");
  }

  /** O5/V6 — role visible to an org only when owned by it or a system template. */
  async getRoleForOrg(id: string, organizationId: string): Promise<Role | null> {
    const role = await this.rbacRepo.findRoleById(id);
    if (!role) return null;
    if (role.organizationId !== organizationId && !role.isSystem) return null;
    if (role.name === "platform_admin") return null;
    return role;
  }

  async createRole(data: InsertRole): Promise<Role> {
    // Check if role name already exists for this organization
    const existing = await this.rbacRepo.findRoleByName(data.name, data.organizationId || null);
    if (existing) {
      throw new HttpError(400, "Ya existe un rol con este nombre");
    }

    return this.rbacRepo.createRole(data);
  }

  /** O6 — organizationId FORCED from the path (org-spoof hole fix). */
  async createOrgRole(
    organizationId: string,
    data: { name: string; displayName?: string; description?: string }
  ): Promise<Role> {
    return this.createRole({
      name: data.name,
      displayName: data.displayName || data.name,
      description: data.description,
      organizationId,
      isSystem: false,
      isActive: true,
    });
  }

  async updateRole(id: string, data: Partial<InsertRole>): Promise<Role | null> {
    const role = await this.rbacRepo.findRoleById(id);
    if (!role) return null;

    // Don't allow modifying system roles
    if (role.isSystem && (data.name || data.organizationId !== undefined)) {
      throw new HttpError(400, "No se puede modificar un rol del sistema");
    }

    return this.rbacRepo.updateRole(id, data);
  }

  /** O7 — update org role: 404 cross-org, 400 isSystem. */
  async updateOrgRole(
    id: string,
    organizationId: string,
    data: Partial<Pick<InsertRole, "name" | "displayName" | "description" | "isActive">>
  ): Promise<Role | null> {
    const role = await this.rbacRepo.findRoleById(id);
    if (!role || role.organizationId !== organizationId) {
      if (role?.isSystem) {
        throw new HttpError(400, "No se puede modificar un rol del sistema");
      }
      return null;
    }

    if (data.name && data.name !== role.name) {
      const existing = await this.rbacRepo.findRoleByName(data.name, organizationId);
      if (existing && existing.id !== id) {
        throw new HttpError(400, "Ya existe un rol con este nombre");
      }
    }

    const updated = await this.rbacRepo.updateRole(id, {
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      isActive: data.isActive,
    });
    this.invalidatePermissionCache(organizationId);
    return updated;
  }

  async deleteRole(id: string): Promise<boolean> {
    const role = await this.rbacRepo.findRoleById(id);
    if (!role) return false;

    if (role.isSystem) {
      throw new HttpError(400, "No se puede eliminar un rol del sistema");
    }

    return this.rbacRepo.deleteRole(id);
  }

  /** O8 — delete org role: 404 cross-org, 400 isSystem, 409 when referenced by members. */
  async deleteOrgRole(id: string, organizationId: string): Promise<boolean> {
    const role = await this.rbacRepo.findRoleById(id);
    if (!role || role.organizationId !== organizationId) {
      if (role?.isSystem) {
        throw new HttpError(400, "No se puede eliminar un rol del sistema");
      }
      return false;
    }

    const memberCount = await this.rbacRepo.countMembersByRole(id);
    if (memberCount > 0) {
      throw new HttpError(409, "El rol está asignado a miembros de la organización. Reasigna esos miembros primero.");
    }

    const deleted = await this.rbacRepo.deleteRole(id);
    this.invalidatePermissionCache(organizationId);
    return deleted;
  }

  // =====================================================================
  // Module/Action retrieval (global catalogs — back-compat O12/O13)
  // =====================================================================
  async getAllModules(): Promise<ModuleWithSubmodules[]> {
    return this.rbacRepo.findAllModules();
  }

  async getAllActions(): Promise<Action[]> {
    return this.rbacRepo.findAllActions();
  }

  // =====================================================================
  // Org-scoped availability (V1) — O1 / O2 / V2 / V4 all resolve from here
  // =====================================================================
  private async resolveAvailability(organizationId: string): Promise<AvailabilityEntry[]> {
    const cached = this.matrixCache.get(organizationId);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.value;
    }

    const [activeModules, allSubmodules, allActions, orgModules, overrides, subActions] = await Promise.all([
      this.rbacRepo.findAllModulesRaw(false),
      this.rbacRepo.findAllSubmodules(false),
      this.rbacRepo.findAllActions(),
      this.orgModuleRepo.findByOrganization(organizationId),
      this.orgModuleRepo.findOverridesByOrganization(organizationId),
      this.orgModuleRepo.findAllSubmoduleActions(),
    ]);

    const orgModuleEnabled = new Map(orgModules.map((om) => [om.moduleId, om.isEnabled]));
    const overrideMap = new Map(overrides.map((ov) => [ov.submoduleId, ov.isEnabled]));
    const actionById = new Map(allActions.map((a) => [a.id, a]));

    const actionsBySubmodule = new Map<string, Action[]>();
    for (const sa of subActions) {
      const action = actionById.get(sa.actionId);
      if (!action) continue;
      const list = actionsBySubmodule.get(sa.submoduleId) || [];
      list.push(action);
      actionsBySubmodule.set(sa.submoduleId, list);
    }

    const entries: AvailabilityEntry[] = [];
    for (const module of activeModules) {
      if (orgModuleEnabled.get(module.id) !== true) continue; // unassigned or disabled

      const moduleSubmodules = allSubmodules
        .filter((sub) => sub.moduleId === module.id)
        .filter((sub) =>
          isSubmoduleAvailable(module.isActive, sub.isActive, orgModuleEnabled.get(module.id), overrideMap.get(sub.id))
        )
        .map((sub) => ({
          submodule: sub,
          actions: actionsBySubmodule.get(sub.id) || [],
        }));

      entries.push({ module, submodules: moduleSubmodules });
    }

    this.matrixCache.set(organizationId, { at: Date.now(), value: entries });
    return entries;
  }

  /** O2 — org-filtered modules → submodules → grantable actions. */
  async getAvailableMatrix(organizationId: string): Promise<AvailableMatrixDto> {
    const entries = await this.resolveAvailability(organizationId);
    return {
      modules: entries.map(({ module, submodules }) => ({
        id: module.id,
        name: module.name,
        displayName: module.displayName,
        icon: module.icon,
        sortOrder: module.sortOrder ?? 0,
        submodules: submodules.map(({ submodule, actions }) => ({
          id: submodule.id,
          name: submodule.name,
          displayName: submodule.displayName,
          sortOrder: submodule.sortOrder ?? 0,
          actions: actions.map((a) => ({ id: a.id, name: a.name, displayName: a.displayName })),
        })),
      })),
    };
  }

  /**
   * V4 — flattened effective permission set for a (role, org) pair:
   * grants ∩ org availability ∩ submodule_actions; module-wide grants are
   * expanded per available submodule; 'owner' resolves as ALL grantable.
   * Returns strings in "module:submodule:action" format.
   */
  private async resolveEffectivePermissions(role: Role, organizationId: string): Promise<Set<string>> {
    const cacheKey = `${role.id}:${organizationId}`;
    const cached = this.permissionCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.value;
    }

    const result = new Set<string>();

    // Disabled role or out-of-scope role resolves to nothing (V3/V4)
    const sameOrg = role.organizationId === organizationId;
    const systemRole = role.isSystem && role.organizationId === null;
    const inScope = (sameOrg || systemRole) && role.name !== "platform_admin";

    if (role.isActive && inScope) {
      const entries = await this.resolveAvailability(organizationId);
      const isOwner = role.name === "owner";

      let moduleWide = new Set<string>();
      let specific = new Set<string>();
      if (!isOwner) {
        const grants = await this.rbacRepo.findPermissionsByRole(role.id);
        moduleWide = new Set(grants.filter((g) => !g.submoduleId).map((g) => `${g.moduleId}|${g.actionId}`));
        specific = new Set(grants.filter((g) => g.submoduleId).map((g) => `${g.moduleId}|${g.submoduleId}|${g.actionId}`));
      }

      for (const { module, submodules } of entries) {
        for (const { submodule, actions } of submodules) {
          for (const action of actions) {
            const granted =
              isOwner ||
              moduleWide.has(`${module.id}|${action.id}`) ||
              specific.has(`${module.id}|${submodule.id}|${action.id}`);
            if (granted) {
              result.add(`${module.name}:${submodule.name}:${action.name}`);
            }
          }
        }
      }
    }

    this.permissionCache.set(cacheKey, { at: Date.now(), value: result });
    return result;
  }

  /** O1 — caller's effective permissions for FE nav/action gating. Null when not a member (403). */
  async getMyPermissions(userId: string, organizationId: string): Promise<MyPermissionsDto | null> {
    const membership = await this.memberRepo.findByUserAndOrganization(userId, organizationId);
    if (!membership) return null;

    const role = await this.rbacRepo.findRoleById(membership.roleId);
    if (!role) return null;

    const permissions = await this.resolveEffectivePermissions(role, organizationId);
    const permissionList = Array.from(permissions);
    const modules = Array.from(new Set(permissionList.map((p) => p.split(":")[0])));

    return {
      role: {
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        isSystem: role.isSystem,
        isActive: role.isActive,
      },
      isOwner: role.name === "owner",
      isAdmin: role.name === "owner" || role.name === "admin",
      modules,
      permissions: permissionList.sort(),
    };
  }

  // =====================================================================
  // Permission management
  // =====================================================================
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return this.rbacRepo.findPermissionsByRole(roleId);
  }

  /** O9 — role grant rows with the O5 scope rule (null = 404). */
  async getRolePermissionsForOrg(roleId: string, organizationId: string): Promise<PermissionGrantDto[] | null> {
    const role = await this.getRoleForOrg(roleId, organizationId);
    if (!role) return null;

    const grants = await this.rbacRepo.findPermissionsByRole(roleId);
    return grants.map((g) => ({
      moduleId: g.moduleId,
      submoduleId: g.submoduleId ?? null,
      actionId: g.actionId,
    }));
  }

  async setRolePermissions(roleId: string, permissions: InsertRolePermission[]): Promise<void> {
    const role = await this.rbacRepo.findRoleById(roleId);
    if (!role) {
      throw new HttpError(404, "Rol no encontrado");
    }

    // Don't allow modifying system role permissions directly
    // (they should only be modified via migration/seed)
    if (role.isSystem) {
      throw new HttpError(400, "No se pueden modificar los permisos de un rol del sistema");
    }

    await this.rbacRepo.setRolePermissions(roleId, permissions);
    this.invalidatePermissionCache(role.organizationId ?? undefined);
  }

  /**
   * O10/V2 — bulk replace, SUBSET-VALIDATED against the org's available
   * matrix. Rejects the whole batch (400 listing offending tuples) — no
   * partial writes. Returns the saved grant count.
   */
  async setRolePermissionsForOrg(
    roleId: string,
    organizationId: string,
    grants: PermissionGrantDto[]
  ): Promise<number> {
    const role = await this.rbacRepo.findRoleById(roleId);
    if (!role || role.organizationId !== organizationId) {
      if (role?.isSystem) {
        throw new HttpError(400, "No se pueden modificar los permisos de un rol del sistema");
      }
      throw new HttpError(404, "Rol no encontrado");
    }

    // Build the grantable index from the availability matrix (V1)
    const entries = await this.resolveAvailability(organizationId);
    const grantable = new Map<string, Map<string, Set<string>>>(); // moduleId -> submoduleId -> actionIds
    for (const { module, submodules } of entries) {
      const subMap = new Map<string, Set<string>>();
      for (const { submodule, actions } of submodules) {
        subMap.set(submodule.id, new Set(actions.map((a) => a.id)));
      }
      grantable.set(module.id, subMap);
    }

    const offenders: string[] = [];
    for (const grant of grants) {
      const subMap = grantable.get(grant.moduleId);
      if (!subMap) {
        offenders.push(`${grant.moduleId}:${grant.submoduleId ?? "*"}:${grant.actionId}`);
        continue;
      }
      if (grant.submoduleId === null || grant.submoduleId === undefined) {
        // Module-wide grant: valid only when the action is grantable on
        // at least one available submodule of the module (V2)
        const availableSomewhere = Array.from(subMap.values()).some((actionIds) => actionIds.has(grant.actionId));
        if (!availableSomewhere) {
          offenders.push(`${grant.moduleId}:*:${grant.actionId}`);
        }
      } else {
        const actionIds = subMap.get(grant.submoduleId);
        if (!actionIds || !actionIds.has(grant.actionId)) {
          offenders.push(`${grant.moduleId}:${grant.submoduleId}:${grant.actionId}`);
        }
      }
    }

    if (offenders.length > 0) {
      throw new HttpError(
        400,
        `Los siguientes permisos no están disponibles para esta organización: ${offenders.join(", ")}`
      );
    }

    await this.rbacRepo.setRolePermissions(
      roleId,
      grants.map((g) => ({
        roleId,
        moduleId: g.moduleId,
        submoduleId: g.submoduleId ?? null,
        actionId: g.actionId,
      }))
    );

    this.invalidatePermissionCache(organizationId);
    return grants.length;
  }

  // =====================================================================
  // Permission checking (V4 / V5)
  // =====================================================================
  async getUserRole(userId: string, organizationId: string): Promise<Role | null> {
    const membership = await this.memberRepo.findByUserAndOrganization(userId, organizationId);
    if (!membership) return null;

    return this.rbacRepo.findRoleById(membership.roleId);
  }

  async isMember(userId: string, organizationId: string): Promise<boolean> {
    const membership = await this.memberRepo.findByUserAndOrganization(userId, organizationId);
    return membership !== null;
  }

  /**
   * V4 — effective permission formula:
   * member exists → role.isActive → role in V3 scope → V1 availability holds
   * → grant row exists (owner resolves as ALL grantable; user-level bypass
   * only via users.role === 'platform_admin').
   */
  async hasPermission(userId: string, organizationId: string, check: PermissionCheck): Promise<boolean> {
    // User-level bypass: users.role === 'platform_admin' (still logged by middleware)
    const user = await this.userRepo.getUser(userId);
    if (user?.role === "platform_admin") return true;

    const membership = await this.memberRepo.findByUserAndOrganization(userId, organizationId);
    if (!membership) return false; // V5 deny-by-default

    const role = await this.rbacRepo.findRoleById(membership.roleId);
    if (!role) return false;

    const effective = await this.resolveEffectivePermissions(role, organizationId);
    if (check.submodule) {
      return effective.has(`${check.module}:${check.submodule}:${check.action}`);
    }

    // No submodule specified: allowed when at least one available submodule
    // of the module carries the action
    const prefix = `${check.module}:`;
    const suffix = `:${check.action}`;
    return Array.from(effective).some((entry) => entry.startsWith(prefix) && entry.endsWith(suffix));
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

  // =====================================================================
  // V8 — cache busting (called on O10/P3/P4/P18 writes)
  // =====================================================================
  invalidatePermissionCache(organizationId?: string): void {
    if (!organizationId) {
      this.matrixCache.clear();
      this.permissionCache.clear();
      return;
    }

    this.matrixCache.delete(organizationId);
    Array.from(this.permissionCache.keys()).forEach((key) => {
      if (key.endsWith(`:${organizationId}`)) {
        this.permissionCache.delete(key);
      }
    });
  }
}
