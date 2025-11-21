import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";

// Deployment History Schema
export const deploymentHistory = pgTable("deployment_history", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: text("organization_id"),
  buildId: varchar("build_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'building', 'uploading', 'success', 'error'
  message: text("message").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  deployUrl: text("deploy_url"),
  errorDetails: text("error_details"),
  filesUploaded: integer("files_uploaded").default(0),
  buildSizeKb: integer("build_size_kb"),
}, (table) => [
  pgPolicy("deployment_history_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type DeploymentHistory = typeof deploymentHistory.$inferSelect;
