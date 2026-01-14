import { sql } from "drizzle-orm";
import { pgTable, varchar, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { templates } from "./Template";

export const templatePages = pgTable("template_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  metaDescription: text("meta_description"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export type TemplatePage = typeof templatePages.$inferSelect;
export type InsertTemplatePage = typeof templatePages.$inferInsert;
