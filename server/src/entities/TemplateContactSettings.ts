import { sql } from "drizzle-orm";
import { pgTable, varchar, text, jsonb } from "drizzle-orm/pg-core";
import { templates } from "./Template";

export const templateContactSettings = pgTable("template_contact_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }),
  businessHours: jsonb("business_hours"),
});

export type TemplateContactSettings = typeof templateContactSettings.$inferSelect;
export type InsertTemplateContactSettings = typeof templateContactSettings.$inferInsert;
