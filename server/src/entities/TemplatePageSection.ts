import { sql } from "drizzle-orm";
import { pgTable, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { templatePages } from "./TemplatePage";

export const templatePageSections = pgTable("template_page_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templatePageId: varchar("template_page_id").notNull().references(() => templatePages.id, { onDelete: "cascade" }),
  sectionType: varchar("section_type", { length: 100 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export type TemplatePageSection = typeof templatePageSections.$inferSelect;
export type InsertTemplatePageSection = typeof templatePageSections.$inferInsert;
