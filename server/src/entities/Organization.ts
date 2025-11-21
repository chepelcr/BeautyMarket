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

  // AWS Resources
  s3BucketName: varchar("s3_bucket_name", { length: 100 }),
  cloudfrontDistributionId: varchar("cloudfront_distribution_id", { length: 100 }),
  cloudfrontDomain: varchar("cloudfront_domain", { length: 255 }),
  route53RecordId: varchar("route53_record_id", { length: 100 }),

  // ACM Certificate (for custom domains)
  acmCertificateArn: varchar("acm_certificate_arn", { length: 255 }),
  acmValidationRecords: jsonb("acm_validation_records"),

  // Infrastructure status
  infrastructureStatus: varchar("infrastructure_status", { length: 50 }).default("pending"),

  // Settings (JSON for theme, logo, colors, payment config, shipping config)
  settings: jsonb("settings"),

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

// Infrastructure status type
export type InfrastructureStatus = "pending" | "provisioning" | "active" | "failed" | "deleting";

// ACM validation record type
export interface ACMValidationRecord {
  name: string;
  type: string;
  value: string;
  status: "PENDING_VALIDATION" | "SUCCESS" | "FAILED";
}

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
