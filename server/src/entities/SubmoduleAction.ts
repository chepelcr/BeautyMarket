import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, varchar, unique } from "drizzle-orm/pg-core";
import { submodules } from "./Submodule";
import { actions } from "./Action";

// Submodule actions - defines which actions are valid/grantable per submodule
// (drives the role-matrix UI and validates permission grants)
export const submoduleActions = pgTable("submodule_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submoduleId: varchar("submodule_id").notNull().references(() => submodules.id, { onDelete: "cascade" }),
  actionId: varchar("action_id").notNull().references(() => actions.id, { onDelete: "cascade" }),
}, (table) => [
  unique("submodule_actions_submodule_action_uq").on(table.submoduleId, table.actionId),
  pgPolicy("submodule_actions_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type SubmoduleAction = typeof submoduleActions.$inferSelect;
export type InsertSubmoduleAction = typeof submoduleActions.$inferInsert;
