import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const components = pgTable("components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  description: text("description"),
  defaultConfig: jsonb("default_config"),
  isSystem: boolean("is_system").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("components_public_read", {
    as: "permissive",
    to: "public",
    for: "select",
    using: sql`true`,
  }),
]).enableRLS();

export type Component = typeof components.$inferSelect;
export type InsertComponent = typeof components.$inferInsert;

// Component default config interface
export interface ComponentConfig {
  fields: string[];
}
