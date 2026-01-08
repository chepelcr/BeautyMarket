import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp, boolean, integer, unique } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";
import { templates } from "./Template";

export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  templateId: varchar("template_id").references(() => templates.id),
  type: varchar("type", { length: 50 }).notNull(), // 'home', 'products', 'categories', 'about', 'contact', 'cart', 'checkout'
  slug: varchar("slug", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  metaDescription: text("meta_description"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  unique().on(table.organizationId, table.slug),
  pgPolicy("pages_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

// Page type enum
export type PageType = 'home' | 'products' | 'categories' | 'about' | 'contact' | 'cart' | 'checkout';
