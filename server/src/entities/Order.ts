import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  provincia: text("provincia").notNull(),
  canton: text("canton").notNull(),
  distrito: text("distrito").notNull(),
  address: text("address").notNull(),
  deliveryMethod: varchar("delivery_method", { length: 50 }).notNull(),
  items: text("items").notNull(), // JSON string of order items
  total: integer("total").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("orders_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Order = typeof orders.$inferSelect;

// Delivery method enum
export const deliveryMethods = ["correos", "uber-flash", "personal"] as const;
export type DeliveryMethod = typeof deliveryMethods[number];
