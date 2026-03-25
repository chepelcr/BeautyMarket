import { integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Read-only Drizzle mapping for the organization_settings table.
 *
 * This table is OWNED and WRITTEN by the infrastructure microservice.
 * This Node.js service only READS from it to check provisioning status
 * before deployments and to obtain resource identifiers (e.g. s3BucketName).
 *
 * Schema matches the Python SQLAlchemy OrganizationSettings model exactly.
 * Do NOT add insert/upsert operations against this table from this service.
 */
export const organizationSettingsTable = pgTable("organization_settings", {
  id:                       integer("id").primaryKey(),
  organizationId:           varchar("organization_id", { length: 36 }).notNull(),
  s3BucketName:             varchar("s3_bucket_name", { length: 100 }),
  cloudfrontDistributionId: varchar("cloudfront_distribution_id", { length: 100 }),
  cloudfrontDomain:         varchar("cloudfront_domain", { length: 255 }),
  route53RecordId:          varchar("route53_record_id", { length: 100 }),
  acmCertificateArn:        varchar("acm_certificate_arn", { length: 255 }),
  acmValidationRecords:     jsonb("acm_validation_records"),
  infrastructureStatus:     varchar("infrastructure_status", { length: 50 }).notNull().default("pending"),
  createdAt:                timestamp("created_at").notNull().default(sql`now()`),
  updatedAt:                timestamp("updated_at").notNull().default(sql`now()`),
});

export type OrganizationSettingsRecord = typeof organizationSettingsTable.$inferSelect;
// No InsertOrganizationSettings — this service never writes this table.

export type InfrastructureStatus = "pending" | "provisioning" | "active" | "failed" | "deleting";
