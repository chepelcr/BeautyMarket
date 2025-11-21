import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";

// Home Page Content Management Schema
export const homePageContent = pgTable("home_page_content", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  section: varchar("section", { length: 100 }).notNull(), // 'hero', 'categories', 'about', 'contact', etc.
  key: varchar("key", { length: 100 }).notNull(), // 'title', 'subtitle', 'background_color', 'button_text', etc.
  value: text("value").notNull(), // The actual content value
  type: varchar("type", { length: 50 }).notNull().default("text"), // 'text', 'color', 'image', 'boolean'
  displayName: varchar("display_name", { length: 200 }).notNull(), // User-friendly name for admin interface
  description: text("description"), // Description of what this content controls
  sortOrder: integer("sort_order").default(0), // For ordering in admin interface
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("home_page_content_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type HomePageContent = typeof homePageContent.$inferSelect;
