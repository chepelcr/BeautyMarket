import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar } from "drizzle-orm/pg-core";

// Actions for RBAC (create, read, update, delete, export, etc.)
export const actions = pgTable("actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
}, (table) => [
  pgPolicy("actions_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Action = typeof actions.$inferSelect;
export type InsertAction = typeof actions.$inferInsert;
