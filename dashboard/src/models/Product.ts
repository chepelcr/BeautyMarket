import { z } from "zod";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  isActive: boolean;
  // Inventory tracking fields
  sku?: string | null;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
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
  // Inventory tracking fields
  sku?: string | null;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
}

export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  categoryId: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  // Inventory tracking fields
  sku: z.string().nullable().optional(),
  stockQuantity: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  trackInventory: z.boolean().optional(),
});
