import { sql } from "drizzle-orm";
import { pgTable, varchar, boolean, text } from "drizzle-orm/pg-core";
import { templates } from "./Template";

export const templatePaymentSettings = pgTable("template_payment_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  cashOnDeliveryEnabled: boolean("cash_on_delivery_enabled").default(false),
  bankTransferEnabled: boolean("bank_transfer_enabled").default(false),
  bankAccountDetails: text("bank_account_details"),
});

export type TemplatePaymentSettings = typeof templatePaymentSettings.$inferSelect;
export type InsertTemplatePaymentSettings = typeof templatePaymentSettings.$inferInsert;
