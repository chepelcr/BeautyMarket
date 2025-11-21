import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, varchar, integer, timestamp } from "drizzle-orm/pg-core";

// Costa Rican Location Management Schema
export const provinces = pgTable("provinces", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("provinces_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export const cantons = pgTable("cantons", {
  id: integer("id").primaryKey(),
  provinceId: integer("province_id").notNull().references(() => provinces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("cantons_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export const districts = pgTable("districts", {
  id: integer("id").primaryKey(),
  provinceId: integer("province_id").notNull().references(() => provinces.id, { onDelete: "cascade" }),
  cantonId: integer("canton_id").notNull().references(() => cantons.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("districts_authenticated_access", {
    as: "permissive",
    to: "authenticated",
    for: "all",
    using: sql`true`,
    withCheck: sql`true`,
  }),
]).enableRLS();

export type Province = typeof provinces.$inferSelect;
export type Canton = typeof cantons.$inferSelect;
export type District = typeof districts.$inferSelect;
