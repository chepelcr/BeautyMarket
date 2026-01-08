import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { pages } from "./Page";

export const pageSections = pgTable("page_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull().references(() => pages.id, { onDelete: 'cascade' }),
  sectionType: varchar("section_type", { length: 100 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("page_sections_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type PageSection = typeof pageSections.$inferSelect;
export type InsertPageSection = typeof pageSections.$inferInsert;
