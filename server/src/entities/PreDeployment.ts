import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";

// Pre-Deployment Management Schema
export const preDeployments = pgTable("pre_deployments", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'ready', 'published', 'error'
  triggerType: varchar("trigger_type", { length: 50 }).notNull(), // 'product', 'category', 'cms'
  triggerAction: varchar("trigger_action", { length: 50 }).notNull(), // 'create', 'update', 'delete'
  entityId: varchar("entity_id", { length: 100 }), // ID of the affected entity
  entityType: varchar("entity_type", { length: 50 }), // 'product', 'category', 'homepage_content'
  changes: jsonb("changes"), // JSON object with the changes made
  buildId: varchar("build_id", { length: 100 }),
  message: text("message").default("Cambios pendientes de publicar"),
  errorDetails: text("error_details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
}, (table) => [
  pgPolicy("pre_deployments_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type PreDeployment = typeof preDeployments.$inferSelect;
