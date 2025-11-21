import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, integer, boolean } from "drizzle-orm/pg-core";

// Modules for RBAC system (products, orders, customers, etc.)
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
}, (table) => [
  pgPolicy("modules_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;
