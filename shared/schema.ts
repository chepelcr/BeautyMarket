import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in colones
  categoryId: varchar("category_id", { length: 36 }).notNull().references(() => categoriesTable.id, { onDelete: "restrict" }),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  provincia: text("provincia").notNull(),
  canton: text("canton").notNull(),
  distrito: text("distrito").notNull(),
  address: text("address").notNull(),
  deliveryMethod: varchar("delivery_method", { length: 50 }).notNull(),
  items: text("items").notNull(), // JSON string of order items
  total: integer("total").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for local auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: text("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role", { length: 20 }).default("admin").notNull(),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Database-level session management for serverless deployment
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(), // SHA-256 hash of JWT
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used").defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
});

// API Keys for public endpoint access
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyName: varchar("key_name", { length: 100 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  permissions: text("permissions").array().default(sql`ARRAY[]::text[]`),
  rateLimitPerHour: integer("rate_limit_per_hour").default(1000),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
});

// Categories table for dynamic category management
export const categoriesTable = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 50 }).unique().notNull(),
  description: text("description").notNull(),
  backgroundColor: varchar("background_color", { length: 7 }).notNull(), // Hex color
  buttonColor: varchar("button_color", { length: 7 }).notNull(), // Hex color
  image1Url: text("image1_url"), // First image for the card
  image2Url: text("image2_url"), // Second image for the card
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Category = typeof categoriesTable.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Home Page Content Management Schema
export const homePageContent = pgTable("home_page_content", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  section: varchar("section", { length: 100 }).notNull(), // 'hero', 'categories', 'about', 'contact', etc.
  key: varchar("key", { length: 100 }).notNull(), // 'title', 'subtitle', 'background_color', 'button_text', etc.
  value: text("value").notNull(), // The actual content value
  type: varchar("type", { length: 50 }).notNull().default("text"), // 'text', 'color', 'image', 'boolean'
  displayName: varchar("display_name", { length: 200 }).notNull(), // User-friendly name for admin interface
  description: text("description"), // Description of what this content controls
  sortOrder: integer("sort_order").default(0), // For ordering in admin interface
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHomePageContentSchema = createInsertSchema(homePageContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHomePageContent = z.infer<typeof insertHomePageContentSchema>;
export type HomePageContent = typeof homePageContent.$inferSelect;

// Deployment History Schema
export const deploymentHistory = pgTable("deployment_history", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  buildId: varchar("build_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'building', 'uploading', 'success', 'error'
  message: text("message").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  deployUrl: text("deploy_url"),
  errorDetails: text("error_details"),
  filesUploaded: integer("files_uploaded").default(0),
  buildSizeKb: integer("build_size_kb"),
});

export const insertDeploymentHistorySchema = createInsertSchema(deploymentHistory).omit({
  id: true,
  startedAt: true,
});

export type InsertDeploymentHistory = z.infer<typeof insertDeploymentHistorySchema>;
export type DeploymentHistory = typeof deploymentHistory.$inferSelect;

// Password Reset Schema
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email Verification Schema
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertEmailVerificationToken = z.infer<typeof insertEmailVerificationTokenSchema>;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Legacy category validation for backward compatibility
export const validCategories = ["maquillaje", "skincare", "accesorios"] as const;
export type ValidCategory = typeof validCategories[number];

// Delivery method enum
export const deliveryMethods = ["correos", "uber-flash", "personal"] as const;
export type DeliveryMethod = typeof deliveryMethods[number];
