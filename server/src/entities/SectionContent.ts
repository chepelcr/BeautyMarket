import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { pageSections } from "./PageSection";
import { components } from "./Component";

export const sectionContent = pgTable("section_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => pageSections.id, { onDelete: 'cascade' }),
  componentId: varchar("component_id").references(() => components.id),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
  valueType: varchar("value_type", { length: 50 }).default("text").notNull(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  unique().on(table.sectionId, table.key),
  pgPolicy("section_content_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type SectionContent = typeof sectionContent.$inferSelect;
export type InsertSectionContent = typeof sectionContent.$inferInsert;

// Value type enum
export type ValueType = 'text' | 'color' | 'image' | 'boolean' | 'json' | 'background';
