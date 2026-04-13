import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

// Organization table for multi-tenant support
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  subdomain: varchar("subdomain", { length: 100 }).unique(),
  customDomain: varchar("custom_domain", { length: 255 }).unique(),
  domainVerified: boolean("domain_verified").default(false),
  verificationToken: varchar("verification_token", { length: 64 }),

  // Settings (JSON for theme, logo, colors, payment config, shipping config)
  // NOTE: This will be deprecated and removed after migration to normalized tables
  settings: jsonb("settings"),

  // Template system fields
  templateId: varchar("template_id", { length: 100 }),

  // Onboarding flow
  onboardingStep: integer("onboarding_step").default(0).notNull(), // 0=not started, 1=basic info, 2=contact info, 3=completed
  ownerId: varchar("owner_id", { length: 100 }).notNull(),

  // Subscription/Billing
  plan: varchar("plan", { length: 50 }).default("free").notNull(),
  billingEmail: text("billing_email"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),

  // Status
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("organizations_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// Organization settings type
export interface OrganizationSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      whatsapp?: string;
    };
  };
  payment?: {
    currency?: string;
    stripeEnabled?: boolean;
    cashOnDeliveryEnabled?: boolean;
  };
  shipping?: {
    freeShippingThreshold?: number;
    defaultShippingCost?: number;
  };
}
