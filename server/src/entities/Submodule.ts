import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { modules } from "./Module";

// Submodules for finer-grained permissions
export const submodules = pgTable("submodules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
}, (table) => [
  pgPolicy("submodules_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Submodule = typeof submodules.$inferSelect;
export type InsertSubmodule = typeof submodules.$inferInsert;
