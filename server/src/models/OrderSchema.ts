import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { orders } from "../entities/Order";

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
