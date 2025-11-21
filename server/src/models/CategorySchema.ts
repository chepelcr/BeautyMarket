import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { categoriesTable } from "../entities/Category";

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
