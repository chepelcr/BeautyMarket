import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in colones
  category: varchar("category", { length: 50 }).notNull(),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Legacy category validation for backward compatibility
export const validCategories = ["maquillaje", "skincare", "accesorios"] as const;
export type ValidCategory = typeof validCategories[number];

// Delivery method enum
export const deliveryMethods = ["correos", "uber-flash", "personal"] as const;
export type DeliveryMethod = typeof deliveryMethods[number];
