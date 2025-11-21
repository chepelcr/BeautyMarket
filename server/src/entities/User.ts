import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

// User storage table for Cognito auth
// id is the Cognito user ID (sub claim)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Cognito sub - not auto-generated
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  gender: varchar("gender", { length: 20 }), // Optional: male, female, other, prefer_not_to_say
  role: varchar("role", { length: 20 }).default("customer").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("users_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
