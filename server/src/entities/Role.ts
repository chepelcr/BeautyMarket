import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";

// Roles for RBAC (Owner, Admin, Manager, Staff, etc.)
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false).notNull(), // System roles can't be deleted
  organizationId: varchar("organization_id").references(() => organizations.id, { onDelete: "cascade" }), // null = platform-wide role
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("roles_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;
