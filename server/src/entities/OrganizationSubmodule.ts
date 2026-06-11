import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, varchar, boolean, unique } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";
import { submodules } from "./Submodule";

// Per-organization submodule override (override-only: NO row = inherit enabled
// when the parent module is assigned + enabled). A row exists only to override.
export const organizationSubmodules = pgTable("organization_submodules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  submoduleId: varchar("submodule_id").notNull().references(() => submodules.id, { onDelete: "cascade" }),
  isEnabled: boolean("is_enabled").default(false).notNull(),
}, (table) => [
  unique("organization_submodules_org_submodule_uq").on(table.organizationId, table.submoduleId),
  pgPolicy("organization_submodules_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type OrganizationSubmodule = typeof organizationSubmodules.$inferSelect;
export type InsertOrganizationSubmodule = typeof organizationSubmodules.$inferInsert;
