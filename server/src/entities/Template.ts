import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  thumbnailUrl: text("thumbnail_url"),
  previewUrl: text("preview_url"),
  repositoryUrl: text("repository_url"), // GitHub repository URL for infrastructure deployment
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("templates_public_read", {
    as: "permissive",
    to: "public",
    for: "select",
    using: sql`true`,
  }),
]).enableRLS();

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;
