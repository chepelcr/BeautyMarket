import type {
  Module,
  InsertModule,
  Submodule,
  InsertSubmodule,
  Action,
  InsertAction,
} from "../entities";
import type { RBACRepository } from "../repositories/RBACRepository";
import type { OrganizationModuleRepository } from "../repositories/OrganizationModuleRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { IRBACService } from "./RBACService";
import { isSubmoduleAvailable } from "./RBACService";
import { DEFAULT_ORG_MODULE_NAMES } from "../seeds/rbac-seed";
import { HttpError } from "../utils/HttpError";

// P1 — org search/list row for the admin UI
export interface AdminOrganizationListItem {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  plan: string;
  isActive: boolean;
  onboardingStep: number;
  createdAt: Date;
  moduleCount: number;
}

export interface AdminOrganizationListResult {
  items: AdminOrganizationListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// P2 — full-catalog assignment state for one org
export interface OrgSubmoduleAssignmentState {
  submodule: Submodule;
  effectiveEnabled: boolean;
  override: boolean | null; // raw organization_submodules.is_enabled, null when no row
}

export interface OrgModuleAssignmentState {
  module: Module;
  assigned: boolean;
  isEnabled: boolean;
  assignedBy: string | null;
  assignedAt: Date | null;
  submodules: OrgSubmoduleAssignmentState[];
}

// P6 — catalog with submodules + each submodule's available actions
export type ModuleCatalogEntry = Module & {
  submodules: Array<Submodule & { actions: Action[] }>;
};

export interface IPlatformRBACService {
  // Org assignment + org search
  searchOrganizations(params: { search?: string; page?: number; pageSize?: number; isActive?: boolean }): Promise<AdminOrganizationListResult>;
  getOrganizationModules(organizationId: string): Promise<OrgModuleAssignmentState[]>;
  setOrganizationModule(organizationId: string, moduleId: string, assigned: boolean, isEnabled: boolean | undefined, assignedBy: string): Promise<OrgModuleAssignmentState>;
  setOrganizationSubmodule(organizationId: string, submoduleId: string, isEnabled: boolean | null): Promise<OrgSubmoduleAssignmentState>;
  applyDefaultModules(organizationId: string): Promise<string[]>;
  assignDefaultModules(organizationId: string, assignedBy: string | null): Promise<string[]>;

  // Catalog CRUD
  getModuleCatalog(includeInactive: boolean): Promise<ModuleCatalogEntry[]>;
  createModule(data: InsertModule): Promise<Module>;
  updateModule(id: string, data: Partial<InsertModule>): Promise<Module | null>;
  deleteModule(id: string): Promise<boolean>;
  createSubmodule(moduleId: string, data: Omit<InsertSubmodule, "moduleId">): Promise<Submodule>;
  updateSubmodule(id: string, data: Partial<InsertSubmodule>): Promise<Submodule | null>;
  deleteSubmodule(id: string): Promise<boolean>;
  getAllActions(): Promise<Action[]>;
  createAction(data: InsertAction): Promise<Action>;
  updateAction(id: string, data: Partial<InsertAction>): Promise<Action | null>;
  deleteAction(id: string): Promise<boolean>;
  getSubmoduleActions(submoduleId: string): Promise<Action[]>;
  setSubmoduleActions(submoduleId: string, actionIds: string[]): Promise<{ count: number; orphanedGrants: number }>;
}

export class PlatformRBACService implements IPlatformRBACService {
  constructor(
    private organizationRepo: OrganizationRepository,
    private rbacRepo: RBACRepository,
    private orgModuleRepo: OrganizationModuleRepository,
    private rbacService: IRBACService
  ) {}

  // =====================================================================
  // P1 — org search/list
  // =====================================================================
  async searchOrganizations(params: {
    search?: string;
    page?: number;
    pageSize?: number;
    isActive?: boolean;
  }): Promise<AdminOrganizationListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

    const { items, total } = await this.organizationRepo.searchPaged({
      search: params.search,
      page,
      pageSize,
      isActive: params.isActive,
    });

    const counts = await this.orgModuleRepo.countByOrganizationIds(items.map((org) => org.id));

    return {
      items: items.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        subdomain: org.subdomain,
        plan: org.plan,
        isActive: org.isActive,
        onboardingStep: org.onboardingStep,
        createdAt: org.createdAt,
        moduleCount: counts.get(org.id) ?? 0,
      })),
      total,
      page,
      pageSize,
    };
  }

  // =====================================================================
  // P2 — assignment state (FULL catalog, incl. unassigned/inactive modules)
  // =====================================================================
  async getOrganizationModules(organizationId: string): Promise<OrgModuleAssignmentState[]> {
    const organization = await this.organizationRepo.findById(organizationId);
    if (!organization) {
      throw new HttpError(404, "Organización no encontrada");
    }

    const [allModules, allSubmodules, orgModules, overrides] = await Promise.all([
      this.rbacRepo.findAllModulesRaw(true),
      this.rbacRepo.findAllSubmodules(true),
      this.orgModuleRepo.findByOrganization(organizationId),
      this.orgModuleRepo.findOverridesByOrganization(organizationId),
    ]);

    const assignmentByModule = new Map(orgModules.map((om) => [om.moduleId, om]));
    const overrideMap = new Map(overrides.map((ov) => [ov.submoduleId, ov.isEnabled]));

    return allModules.map((module) =>
      this.buildModuleState(module, allSubmodules.filter((s) => s.moduleId === module.id), assignmentByModule.get(module.id), overrideMap)
    );
  }

  private buildModuleState(
    module: Module,
    moduleSubmodules: Submodule[],
    assignment: { isEnabled: boolean; assignedBy: string | null; assignedAt: Date } | undefined,
    overrideMap: Map<string, boolean>
  ): OrgModuleAssignmentState {
    return {
      module,
      assigned: assignment !== undefined,
      isEnabled: assignment?.isEnabled ?? false,
      assignedBy: assignment?.assignedBy ?? null,
      assignedAt: assignment?.assignedAt ?? null,
      submodules: moduleSubmodules.map((submodule) => ({
        submodule,
        // V1 — single availability definition
        effectiveEnabled: isSubmoduleAvailable(
          module.isActive,
          submodule.isActive,
          assignment?.isEnabled,
          overrideMap.get(submodule.id)
        ),
        override: overrideMap.has(submodule.id) ? overrideMap.get(submodule.id)! : null,
      })),
    };
  }

  // =====================================================================
  // P3 — assign / unassign / enable / disable a module for an org
  // =====================================================================
  async setOrganizationModule(
    organizationId: string,
    moduleId: string,
    assigned: boolean,
    isEnabled: boolean | undefined,
    assignedBy: string
  ): Promise<OrgModuleAssignmentState> {
    const organization = await this.organizationRepo.findById(organizationId);
    if (!organization) {
      throw new HttpError(404, "Organización no encontrada");
    }

    const module = await this.rbacRepo.findModuleById(moduleId);
    if (!module) {
      throw new HttpError(404, "Módulo no encontrado");
    }

    if (assigned) {
      await this.orgModuleRepo.upsert({
        organizationId,
        moduleId,
        isEnabled: isEnabled ?? true,
        assignedBy,
      });
    } else {
      // Unassign: delete the row + the module's submodule overrides
      await this.orgModuleRepo.deleteOverridesForModule(organizationId, moduleId);
      await this.orgModuleRepo.deleteByOrganizationAndModule(organizationId, moduleId);
    }

    // Kill-switch takes effect immediately (V4)
    this.rbacService.invalidatePermissionCache(organizationId);

    return this.getModuleState(organizationId, moduleId);
  }

  private async getModuleState(organizationId: string, moduleId: string): Promise<OrgModuleAssignmentState> {
    const module = await this.rbacRepo.findModuleById(moduleId);
    if (!module) {
      throw new HttpError(404, "Módulo no encontrado");
    }

    const [moduleSubmodules, assignment, overrides] = await Promise.all([
      this.rbacRepo.findSubmodulesByModule(moduleId),
      this.orgModuleRepo.findByOrganizationAndModule(organizationId, moduleId),
      this.orgModuleRepo.findOverridesByOrganization(organizationId),
    ]);

    const overrideMap = new Map(overrides.map((ov) => [ov.submoduleId, ov.isEnabled]));
    return this.buildModuleState(module, moduleSubmodules, assignment ?? undefined, overrideMap);
  }

  // =====================================================================
  // P4 — per-org submodule override (null = delete row = inherit)
  // =====================================================================
  async setOrganizationSubmodule(
    organizationId: string,
    submoduleId: string,
    isEnabled: boolean | null
  ): Promise<OrgSubmoduleAssignmentState> {
    const submodule = await this.rbacRepo.findSubmoduleById(submoduleId);
    if (!submodule) {
      throw new HttpError(404, "Submódulo no encontrado");
    }

    const assignment = await this.orgModuleRepo.findByOrganizationAndModule(organizationId, submodule.moduleId);
    if (!assignment) {
      throw new HttpError(400, "El módulo padre no está asignado a esta organización");
    }

    if (isEnabled === null) {
      await this.orgModuleRepo.deleteOverride(organizationId, submoduleId);
    } else {
      await this.orgModuleRepo.upsertOverride(organizationId, submoduleId, isEnabled);
    }

    this.rbacService.invalidatePermissionCache(organizationId);

    const module = await this.rbacRepo.findModuleById(submodule.moduleId);
    const override = await this.orgModuleRepo.findOverride(organizationId, submoduleId);
    return {
      submodule,
      effectiveEnabled: isSubmoduleAvailable(
        module?.isActive ?? false,
        submodule.isActive,
        assignment.isEnabled,
        override?.isEnabled
      ),
      override: override ? override.isEnabled : null,
    };
  }

  // =====================================================================
  // P5 — apply the default module set (idempotent)
  // =====================================================================
  async applyDefaultModules(organizationId: string): Promise<string[]> {
    const organization = await this.organizationRepo.findById(organizationId);
    if (!organization) {
      throw new HttpError(404, "Organización no encontrada");
    }

    return this.assignDefaultModules(organizationId, null);
  }

  /** Shared by P5 and OrganizationService.create — returns inserted module NAMES. */
  async assignDefaultModules(organizationId: string, assignedBy: string | null): Promise<string[]> {
    const moduleIdToName = new Map<string, string>();
    for (const name of DEFAULT_ORG_MODULE_NAMES) {
      const module = await this.rbacRepo.findModuleByName(name);
      if (module) {
        moduleIdToName.set(module.id, module.name);
      } else {
        console.warn(`[PlatformRBACService] Default module '${name}' not found — run the RBAC seed`);
      }
    }

    const insertedIds = await this.orgModuleRepo.insertMissing(
      organizationId,
      Array.from(moduleIdToName.keys()),
      assignedBy
    );

    this.rbacService.invalidatePermissionCache(organizationId);
    return insertedIds.map((id) => moduleIdToName.get(id)!);
  }

  // =====================================================================
  // P6–P18 — catalog CRUD
  // =====================================================================
  async getModuleCatalog(includeInactive: boolean): Promise<ModuleCatalogEntry[]> {
    const [allModules, allSubmodules, allActions, subActions] = await Promise.all([
      this.rbacRepo.findAllModulesRaw(includeInactive),
      this.rbacRepo.findAllSubmodules(includeInactive),
      this.rbacRepo.findAllActions(),
      this.orgModuleRepo.findAllSubmoduleActions(),
    ]);

    const actionById = new Map(allActions.map((a) => [a.id, a]));
    const actionsBySubmodule = new Map<string, Action[]>();
    for (const sa of subActions) {
      const action = actionById.get(sa.actionId);
      if (!action) continue;
      const list = actionsBySubmodule.get(sa.submoduleId) || [];
      list.push(action);
      actionsBySubmodule.set(sa.submoduleId, list);
    }

    return allModules.map((module) => ({
      ...module,
      submodules: allSubmodules
        .filter((sub) => sub.moduleId === module.id)
        .map((sub) => ({ ...sub, actions: actionsBySubmodule.get(sub.id) || [] })),
    }));
  }

  async createModule(data: InsertModule): Promise<Module> {
    const existing = await this.rbacRepo.findModuleByName(data.name);
    if (existing) {
      throw new HttpError(400, "Ya existe un módulo con este nombre");
    }
    return this.rbacRepo.createModule(data);
  }

  async updateModule(id: string, data: Partial<InsertModule>): Promise<Module | null> {
    if (data.name) {
      const existing = await this.rbacRepo.findModuleByName(data.name);
      if (existing && existing.id !== id) {
        throw new HttpError(400, "Ya existe un módulo con este nombre");
      }
    }
    const updated = await this.rbacRepo.updateModule(id, data);
    if (updated) this.rbacService.invalidatePermissionCache();
    return updated;
  }

  async deleteModule(id: string): Promise<boolean> {
    const module = await this.rbacRepo.findModuleById(id);
    if (!module) return false;

    // 409 if referenced — force explicit cleanup; never rely on silent cascade
    const [grantRefs, orgRefs] = await Promise.all([
      this.rbacRepo.countPermissionsByModule(id),
      this.orgModuleRepo.countByModule(id),
    ]);
    if (grantRefs > 0 || orgRefs > 0) {
      throw new HttpError(
        409,
        `El módulo está referenciado (${grantRefs} permisos de rol, ${orgRefs} asignaciones de organización). Desactívalo con isActive=false o limpia las referencias primero.`
      );
    }

    const deleted = await this.rbacRepo.deleteModule(id);
    if (deleted) this.rbacService.invalidatePermissionCache();
    return deleted;
  }

  async createSubmodule(moduleId: string, data: Omit<InsertSubmodule, "moduleId">): Promise<Submodule> {
    const module = await this.rbacRepo.findModuleById(moduleId);
    if (!module) {
      throw new HttpError(404, "Módulo no encontrado");
    }

    const siblings = await this.rbacRepo.findSubmodulesByModule(moduleId);
    if (siblings.some((s) => s.name === data.name)) {
      throw new HttpError(400, "Ya existe un submódulo con este nombre en el módulo");
    }

    return this.rbacRepo.createSubmodule({ ...data, moduleId });
  }

  async updateSubmodule(id: string, data: Partial<InsertSubmodule>): Promise<Submodule | null> {
    const submodule = await this.rbacRepo.findSubmoduleById(id);
    if (!submodule) return null;

    if (data.name && data.name !== submodule.name) {
      const siblings = await this.rbacRepo.findSubmodulesByModule(submodule.moduleId);
      if (siblings.some((s) => s.name === data.name && s.id !== id)) {
        throw new HttpError(400, "Ya existe un submódulo con este nombre en el módulo");
      }
    }

    const updated = await this.rbacRepo.updateSubmodule(id, data);
    if (updated) this.rbacService.invalidatePermissionCache();
    return updated;
  }

  async deleteSubmodule(id: string): Promise<boolean> {
    const submodule = await this.rbacRepo.findSubmoduleById(id);
    if (!submodule) return false;

    const [grantRefs, overrideRefs] = await Promise.all([
      this.rbacRepo.countPermissionsBySubmodule(id),
      this.orgModuleRepo.countOverridesBySubmodule(id),
    ]);
    if (grantRefs > 0 || overrideRefs > 0) {
      throw new HttpError(
        409,
        `El submódulo está referenciado (${grantRefs} permisos de rol, ${overrideRefs} overrides de organización). Desactívalo con isActive=false o limpia las referencias primero.`
      );
    }

    const deleted = await this.rbacRepo.deleteSubmodule(id);
    if (deleted) this.rbacService.invalidatePermissionCache();
    return deleted;
  }

  async getAllActions(): Promise<Action[]> {
    return this.rbacRepo.findAllActions();
  }

  async createAction(data: InsertAction): Promise<Action> {
    const existing = await this.rbacRepo.findActionByName(data.name);
    if (existing) {
      throw new HttpError(400, "Ya existe una acción con este nombre");
    }
    return this.rbacRepo.createAction(data);
  }

  async updateAction(id: string, data: Partial<InsertAction>): Promise<Action | null> {
    if (data.name) {
      const existing = await this.rbacRepo.findActionByName(data.name);
      if (existing && existing.id !== id) {
        throw new HttpError(400, "Ya existe una acción con este nombre");
      }
    }
    const updated = await this.rbacRepo.updateAction(id, data);
    if (updated) this.rbacService.invalidatePermissionCache();
    return updated;
  }

  async deleteAction(id: string): Promise<boolean> {
    const action = await this.rbacRepo.findActionById(id);
    if (!action) return false;

    const [grantRefs, matrixRefs] = await Promise.all([
      this.rbacRepo.countPermissionsByAction(id),
      this.orgModuleRepo.countSubmoduleActionsByAction(id),
    ]);
    if (grantRefs > 0 || matrixRefs > 0) {
      throw new HttpError(
        409,
        `La acción está referenciada (${grantRefs} permisos de rol, ${matrixRefs} acciones de submódulo). Limpia las referencias primero.`
      );
    }

    const deleted = await this.rbacRepo.deleteAction(id);
    if (deleted) this.rbacService.invalidatePermissionCache();
    return deleted;
  }

  // P17
  async getSubmoduleActions(submoduleId: string): Promise<Action[]> {
    const submodule = await this.rbacRepo.findSubmoduleById(submoduleId);
    if (!submodule) {
      throw new HttpError(404, "Submódulo no encontrado");
    }

    const rows = await this.orgModuleRepo.findActionsBySubmodule(submoduleId);
    const allActions = await this.rbacRepo.findAllActions();
    const actionById = new Map(allActions.map((a) => [a.id, a]));
    return rows.map((row) => actionById.get(row.actionId)).filter((a): a is Action => a !== undefined);
  }

  // P18 — bulk replace a submodule's available-action set
  async setSubmoduleActions(submoduleId: string, actionIds: string[]): Promise<{ count: number; orphanedGrants: number }> {
    const submodule = await this.rbacRepo.findSubmoduleById(submoduleId);
    if (!submodule) {
      throw new HttpError(404, "Submódulo no encontrado");
    }

    // 400 on unknown actionId
    const allActions = await this.rbacRepo.findAllActions();
    const knownIds = new Set(allActions.map((a) => a.id));
    const unknown = actionIds.filter((id) => !knownIds.has(id));
    if (unknown.length > 0) {
      throw new HttpError(400, `Acciones desconocidas: ${unknown.join(", ")}`);
    }

    // Detect grants orphaned by removed actions (they stay but become
    // non-grantable — runtime rule V4 already nullifies them)
    const previous = await this.orgModuleRepo.findActionsBySubmodule(submoduleId);
    const newSet = new Set(actionIds);
    const removed = previous.filter((row) => !newSet.has(row.actionId));
    let orphanedGrants = 0;
    for (const row of removed) {
      orphanedGrants += await this.rbacRepo.countPermissionsBySubmoduleAndAction(submoduleId, row.actionId);
    }

    const count = await this.orgModuleRepo.setSubmoduleActions(submoduleId, Array.from(newSet));
    this.rbacService.invalidatePermissionCache();
    return { count, orphanedGrants };
  }
}
