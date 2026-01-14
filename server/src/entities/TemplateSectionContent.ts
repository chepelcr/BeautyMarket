import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer } from "drizzle-orm/pg-core";
import { templatePageSections } from "./TemplatePageSection";

export const templateSectionContent = pgTable("template_section_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateSectionId: varchar("template_section_id").notNull().references(() => templatePageSections.id, { onDelete: "cascade" }),
  componentId: varchar("component_id", { length: 100 }),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  valueType: varchar("value_type", { length: 50 }).default("string"),
  displayName: varchar("display_name", { length: 200 }),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

export type TemplateSectionContent = typeof templateSectionContent.$inferSelect;
export type InsertTemplateSectionContent = typeof templateSectionContent.$inferInsert;
