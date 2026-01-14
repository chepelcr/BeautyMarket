import { sql } from "drizzle-orm";
import { pgTable, varchar, text } from "drizzle-orm/pg-core";
import { templates } from "./Template";

export const templateThemeSettings = pgTable("template_theme_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  primaryColor: varchar("primary_color", { length: 7 }),
  secondaryColor: varchar("secondary_color", { length: 7 }),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  fontFamily: varchar("font_family", { length: 100 }),
  loadingIcon: text("loading_icon"),
  productFallbackIcon: text("product_fallback_icon"),
});

export type TemplateThemeSettings = typeof templateThemeSettings.$inferSelect;
export type InsertTemplateThemeSettings = typeof templateThemeSettings.$inferInsert;
