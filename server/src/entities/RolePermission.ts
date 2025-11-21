import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, varchar } from "drizzle-orm/pg-core";
import { roles } from "./Role";
import { modules } from "./Module";
import { submodules } from "./Submodule";
import { actions } from "./Action";

// Role permissions - defines what actions a role can perform on modules/submodules
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  submoduleId: varchar("submodule_id").references(() => submodules.id, { onDelete: "cascade" }), // null = applies to all submodules
  actionId: varchar("action_id").notNull().references(() => actions.id, { onDelete: "cascade" }),
}, (table) => [
  pgPolicy("role_permissions_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;
