import { z } from "zod";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  provincia: string;
  canton: string;
  distrito: string;
  address: string;
  deliveryMethod: string;
  items: string;
  total: number;
  status: string;
  createdAt: Date;
}

export interface InsertOrder {
  customerName: string;
  customerPhone: string;
  provincia: string;
  canton: string;
  distrito: string;
  address: string;
  deliveryMethod: string;
  items: string;
  total: number;
  status?: string;
}

export const insertOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  provincia: z.string().min(1),
  canton: z.string().min(1),
  distrito: z.string().min(1),
  address: z.string().min(1),
  deliveryMethod: z.string().min(1),
  items: z.string().min(1),
  total: z.number().min(0),
  status: z.string().optional(),
});

export const deliveryMethods = ["correos", "uber-flash", "personal"] as const;
export type DeliveryMethod = typeof deliveryMethods[number];
