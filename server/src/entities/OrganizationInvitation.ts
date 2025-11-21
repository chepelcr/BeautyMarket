import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";
import { users } from "./User";
import { roles } from "./Role";

// Organization invitations for inviting users to join
export const organizationInvitations = pgTable("organization_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  roleId: varchar("role_id").notNull().references(() => roles.id),
  token: varchar("token", { length: 100 }).notNull().unique(),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, accepted, expired, cancelled
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("organization_invitations_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type OrganizationInvitation = typeof organizationInvitations.$inferSelect;
export type InsertOrganizationInvitation = typeof organizationInvitations.$inferInsert;
