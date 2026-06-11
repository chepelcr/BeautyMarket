import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, varchar, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";
import { modules } from "./Module";
import { users } from "./User";

// Platform-managed module assignment per organization (Tsuru admin writes this)
export const organizationModules = pgTable("organization_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  isEnabled: boolean("is_enabled").default(true).notNull(), // platform can disable without unassigning
  assignedBy: varchar("assigned_by").references(() => users.id, { onDelete: "set null" }), // null for seeded/backfilled rows
  assignedAt: timestamp("assigned_at").default(sql`now()`).notNull(),
}, (table) => [
  unique("organization_modules_org_module_uq").on(table.organizationId, table.moduleId),
  pgPolicy("organization_modules_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type OrganizationModule = typeof organizationModules.$inferSelect;
export type InsertOrganizationModule = typeof organizationModules.$inferInsert;
