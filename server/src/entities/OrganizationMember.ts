import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./Organization";
import { users } from "./User";
import { roles } from "./Role";

// Organization membership - links users to organizations with roles
export const organizationMembers = pgTable("organization_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: varchar("role_id").notNull().references(() => roles.id),
  isDefault: boolean("is_default").default(false), // User's default organization
  invitedBy: varchar("invited_by").references(() => users.id),
  joinedAt: timestamp("joined_at").default(sql`now()`).notNull(),
}, (table) => [
  pgPolicy("organization_members_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = typeof organizationMembers.$inferInsert;
