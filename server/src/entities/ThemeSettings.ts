import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";

export const themeSettings = pgTable("theme_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }).unique(),
  primaryColor: varchar("primary_color", { length: 7 }).default("#ec4899"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#f472b6"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  fontFamily: varchar("font_family", { length: 100 }).default("Inter"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("theme_settings_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type ThemeSettings = typeof themeSettings.$inferSelect;
export type InsertThemeSettings = typeof themeSettings.$inferInsert;
