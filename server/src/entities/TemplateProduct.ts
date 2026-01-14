import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { templates } from "./Template";

export const templateProducts = pgTable("template_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  categoryId: varchar("category_id"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sku: varchar("sku", { length: 100 }),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  isService: boolean("is_service").default(false).notNull(),
  type: varchar("type", { length: 20 }).default('product').notNull(),
  onSale: boolean("on_sale").default(false).notNull(),
  originalPrice: integer("original_price"),
  discount: integer("discount"),
  duration: varchar("duration", { length: 100 }),
  difficulty: varchar("difficulty", { length: 20 }),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export type TemplateProduct = typeof templateProducts.$inferSelect;
