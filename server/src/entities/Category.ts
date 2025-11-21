import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";

// Categories table for dynamic category management
export const categoriesTable = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 50 }).unique().notNull(),
  description: text("description").notNull(),
  backgroundColor: varchar("background_color", { length: 7 }).notNull(), // Hex color
  buttonColor: varchar("button_color", { length: 7 }).notNull(), // Hex color
  image1Url: text("image1_url"), // First image for the card
  image2Url: text("image2_url"), // Second image for the card
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("categories_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Category = typeof categoriesTable.$inferSelect;

// Legacy category validation for backward compatibility
export const validCategories = ["electronics", "clothing", "home"] as const;
export type ValidCategory = typeof validCategories[number];
