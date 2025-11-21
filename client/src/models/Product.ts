import { z } from "zod";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertProduct {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string | null;
  isActive?: boolean;
}

export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  categoryId: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
