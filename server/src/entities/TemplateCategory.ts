import { sql } from "drizzle-orm";
import { pgTable, varchar, text, boolean, integer } from "drizzle-orm/pg-core";
import { templates } from "./Template";

export const templateCategories = pgTable("template_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  backgroundColor: varchar("background_color", { length: 7 }),
  buttonColor: varchar("button_color", { length: 7 }),
  image1Url: text("image1_url"),
  image2Url: text("image2_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export type TemplateCategory = typeof templateCategories.$inferSelect;
export type InsertTemplateCategory = typeof templateCategories.$inferInsert;
