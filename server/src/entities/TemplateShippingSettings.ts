import { sql } from "drizzle-orm";
import { pgTable, varchar, numeric, boolean } from "drizzle-orm/pg-core";
import { templates } from "./Template";

export const templateShippingSettings = pgTable("template_shipping_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  freeShippingThreshold: numeric("free_shipping_threshold", { precision: 10, scale: 2 }),
  defaultShippingCost: numeric("default_shipping_cost", { precision: 10, scale: 2 }),
  enableLocalPickup: boolean("enable_local_pickup").default(false),
  enableCorreosShipping: boolean("enable_correos_shipping").default(false),
  enableUberFlash: boolean("enable_uber_flash").default(false),
});

export type TemplateShippingSettings = typeof templateShippingSettings.$inferSelect;
export type InsertTemplateShippingSettings = typeof templateShippingSettings.$inferInsert;
