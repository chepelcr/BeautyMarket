import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "../entities/Product";

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
