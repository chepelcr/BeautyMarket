import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { customers } from "../entities/Customer";

export const insertCustomerSchema = createInsertSchema(customers, {
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalOrders: true,
  totalSpent: true,
  lastOrderDate: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
