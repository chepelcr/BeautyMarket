import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";

export const paymentSettings = pgTable("payment_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }).unique(),
  currency: varchar("currency", { length: 3 }).default("CRC"),
  stripeEnabled: boolean("stripe_enabled").default(false),
  stripePublishableKey: text("stripe_publishable_key"),
  stripeSecretKey: text("stripe_secret_key"),
  cashOnDeliveryEnabled: boolean("cash_on_delivery_enabled").default(true),
  bankTransferEnabled: boolean("bank_transfer_enabled").default(false),
  bankAccountDetails: text("bank_account_details"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("payment_settings_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type InsertPaymentSettings = typeof paymentSettings.$inferInsert;
