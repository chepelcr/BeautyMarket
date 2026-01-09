import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, integer, timestamp, decimal, jsonb, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  address: jsonb("address").$type<{
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }>(),
  totalOrders: integer("total_orders").default(0).notNull(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lastOrderDate: timestamp("last_order_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("customers_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
