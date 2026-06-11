import { eq, and, inArray, sql } from "drizzle-orm";
import { db } from "../config/database";
import {
  organizationModules,
  organizationSubmodules,
  submoduleActions,
  submodules,
  type OrganizationModule,
  type InsertOrganizationModule,
  type OrganizationSubmodule,
  type SubmoduleAction,
} from "../entities";

export interface IOrganizationModuleRepository {
  // organization_modules
  findByOrganization(organizationId: string): Promise<OrganizationModule[]>;
  findByOrganizationAndModule(organizationId: string, moduleId: string): Promise<OrganizationModule | null>;
  upsert(data: InsertOrganizationModule): Promise<OrganizationModule>;
  deleteByOrganizationAndModule(organizationId: string, moduleId: string): Promise<boolean>;
  countByModule(moduleId: string): Promise<number>;
  countByOrganizationIds(organizationIds: string[]): Promise<Map<string, number>>;
  insertMissing(organizationId: string, moduleIds: string[], assignedBy: string | null): Promise<string[]>;

  // organization_submodules (overrides)
  findOverridesByOrganization(organizationId: string): Promise<OrganizationSubmodule[]>;
  findOverride(organizationId: string, submoduleId: string): Promise<OrganizationSubmodule | null>;
  upsertOverride(organizationId: string, submoduleId: string, isEnabled: boolean): Promise<OrganizationSubmodule>;
  deleteOverride(organizationId: string, submoduleId: string): Promise<boolean>;
  deleteOverridesForModule(organizationId: string, moduleId: string): Promise<void>;
  countOverridesBySubmodule(submoduleId: string): Promise<number>;

  // submodule_actions
  findAllSubmoduleActions(): Promise<SubmoduleAction[]>;
  findActionsBySubmodule(submoduleId: string): Promise<SubmoduleAction[]>;
  setSubmoduleActions(submoduleId: string, actionIds: string[]): Promise<number>;
  countSubmoduleActionsByAction(actionId: string): Promise<number>;
}

export class OrganizationModuleRepository implements IOrganizationModuleRepository {
  // ---------------------------------------------------------------------
  // organization_modules
  // ---------------------------------------------------------------------
  async findByOrganization(organizationId: string): Promise<OrganizationModule[]> {
    return db
      .select()
      .from(organizationModules)
      .where(eq(organizationModules.organizationId, organizationId));
  }

  async findByOrganizationAndModule(organizationId: string, moduleId: string): Promise<OrganizationModule | null> {
    const result = await db
      .select()
      .from(organizationModules)
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(organizationModules.moduleId, moduleId)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  async upsert(data: InsertOrganizationModule): Promise<OrganizationModule> {
    const existing = await this.findByOrganizationAndModule(data.organizationId, data.moduleId);
    if (existing) {
      const result = await db
        .update(organizationModules)
        .set({
          isEnabled: data.isEnabled ?? existing.isEnabled,
          assignedBy: data.assignedBy !== undefined ? data.assignedBy : existing.assignedBy,
        })
        .where(eq(organizationModules.id, existing.id))
        .returning();
      return result[0];
    }

    const result = await db
      .insert(organizationModules)
      .values(data)
      .returning();
    return result[0];
  }

  async deleteByOrganizationAndModule(organizationId: string, moduleId: string): Promise<boolean> {
    const result = await db
      .delete(organizationModules)
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(organizationModules.moduleId, moduleId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async countByModule(moduleId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationModules)
      .where(eq(organizationModules.moduleId, moduleId));
    return result[0]?.count ?? 0;
  }

  async countByOrganizationIds(organizationIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    if (organizationIds.length === 0) return counts;

    const result = await db
      .select({
        organizationId: organizationModules.organizationId,
        count: sql<number>`count(*)::int`,
      })
      .from(organizationModules)
      .where(inArray(organizationModules.organizationId, organizationIds))
      .groupBy(organizationModules.organizationId);

    for (const row of result) {
      counts.set(row.organizationId, row.count);
    }
    return counts;
  }

  /**
   * Idempotently insert assignment rows for the given modules; returns the
   * moduleIds that were actually inserted (existing rows untouched).
   */
  async insertMissing(organizationId: string, moduleIds: string[], assignedBy: string | null): Promise<string[]> {
    if (moduleIds.length === 0) return [];

    const existing = await this.findByOrganization(organizationId);
    const existingModuleIds = new Set(existing.map((row) => row.moduleId));
    const missing = moduleIds.filter((id) => !existingModuleIds.has(id));

    if (missing.length > 0) {
      await db.insert(organizationModules).values(
        missing.map((moduleId) => ({
          organizationId,
          moduleId,
          isEnabled: true,
          assignedBy,
        }))
      );
    }

    return missing;
  }

  // ---------------------------------------------------------------------
  // organization_submodules (override-only: no row = inherit enabled)
  // ---------------------------------------------------------------------
  async findOverridesByOrganization(organizationId: string): Promise<OrganizationSubmodule[]> {
    return db
      .select()
      .from(organizationSubmodules)
      .where(eq(organizationSubmodules.organizationId, organizationId));
  }

  async findOverride(organizationId: string, submoduleId: string): Promise<OrganizationSubmodule | null> {
    const result = await db
      .select()
      .from(organizationSubmodules)
      .where(
        and(
          eq(organizationSubmodules.organizationId, organizationId),
          eq(organizationSubmodules.submoduleId, submoduleId)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  async upsertOverride(organizationId: string, submoduleId: string, isEnabled: boolean): Promise<OrganizationSubmodule> {
    const existing = await this.findOverride(organizationId, submoduleId);
    if (existing) {
      const result = await db
        .update(organizationSubmodules)
        .set({ isEnabled })
        .where(eq(organizationSubmodules.id, existing.id))
        .returning();
      return result[0];
    }

    const result = await db
      .insert(organizationSubmodules)
      .values({ organizationId, submoduleId, isEnabled })
      .returning();
    return result[0];
  }

  async deleteOverride(organizationId: string, submoduleId: string): Promise<boolean> {
    const result = await db
      .delete(organizationSubmodules)
      .where(
        and(
          eq(organizationSubmodules.organizationId, organizationId),
          eq(organizationSubmodules.submoduleId, submoduleId)
        )
      )
      .returning();
    return result.length > 0;
  }

  /** Delete all submodule overrides belonging to one module of an org (used when unassigning the module). */
  async deleteOverridesForModule(organizationId: string, moduleId: string): Promise<void> {
    const moduleSubmodules = await db
      .select({ id: submodules.id })
      .from(submodules)
      .where(eq(submodules.moduleId, moduleId));

    const submoduleIds = moduleSubmodules.map((s) => s.id);
    if (submoduleIds.length === 0) return;

    await db
      .delete(organizationSubmodules)
      .where(
        and(
          eq(organizationSubmodules.organizationId, organizationId),
          inArray(organizationSubmodules.submoduleId, submoduleIds)
        )
      );
  }

  async countOverridesBySubmodule(submoduleId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationSubmodules)
      .where(eq(organizationSubmodules.submoduleId, submoduleId));
    return result[0]?.count ?? 0;
  }

  // ---------------------------------------------------------------------
  // submodule_actions (grantable actions per submodule)
  // ---------------------------------------------------------------------
  async findAllSubmoduleActions(): Promise<SubmoduleAction[]> {
    return db.select().from(submoduleActions);
  }

  async findActionsBySubmodule(submoduleId: string): Promise<SubmoduleAction[]> {
    return db
      .select()
      .from(submoduleActions)
      .where(eq(submoduleActions.submoduleId, submoduleId));
  }

  /** Bulk replace a submodule's available-action set; returns the new count. */
  async setSubmoduleActions(submoduleId: string, actionIds: string[]): Promise<number> {
    await db
      .delete(submoduleActions)
      .where(eq(submoduleActions.submoduleId, submoduleId));

    if (actionIds.length > 0) {
      await db.insert(submoduleActions).values(
        actionIds.map((actionId) => ({ submoduleId, actionId }))
      );
    }

    return actionIds.length;
  }

  async countSubmoduleActionsByAction(actionId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(submoduleActions)
      .where(eq(submoduleActions.actionId, actionId));
    return result[0]?.count ?? 0;
  }
}
