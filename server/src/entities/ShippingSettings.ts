import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";

export const shippingSettings = pgTable("shipping_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }).unique(),
  freeShippingThreshold: integer("free_shipping_threshold"), // in cents
  defaultShippingCost: integer("default_shipping_cost"), // in cents
  enableLocalPickup: boolean("enable_local_pickup").default(true),
  enableCorreosShipping: boolean("enable_correos_shipping").default(true),
  enableUberFlash: boolean("enable_uber_flash").default(true),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("shipping_settings_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type ShippingSettings = typeof shippingSettings.$inferSelect;
export type InsertShippingSettings = typeof shippingSettings.$inferInsert;
