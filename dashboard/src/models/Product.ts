import { z } from "zod";

export interface ProductCode {
  codeType: string;
  number: string;
}

export interface ProductDiscount {
  discountType: string;
  percentage?: number;
  amount?: number;
  reason?: string;
}

export interface TaxSpecialFields {
  quantity?: number;
  percentage?: number;
  proportion?: number;
  volumeConsumption?: number;
  taxUnitAmount?: number;
  taxAmountId?: number;
}

export interface ProductTax {
  taxType: string;
  rate?: number;
  amount?: number;
  taxRateId?: number;
  taxFactorId?: number;
  factor?: number;
  otherTaxType?: string;
  specialFields?: TaxSpecialFields;
}

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
  // Product codes
  internalCode?: string | null;
  originalCode?: string | null;
  clientArticleCode?: string | null;
  code?: string | null;
  unitsPerBox?: number | null;
  // Fiscal
  cabys?: string | null;
  cabysDescription?: string | null;
  productTypeId?: number;
  unitId?: number;
  commercialUnitMeasure?: string | null;
  // Packaging
  isPackaged?: boolean;
  quantity?: number;
  unitPrice?: number;
  // Customs
  customsPart?: string | null;
  // Complex fields (stored as JSON)
  codes?: ProductCode[];
  discounts?: ProductDiscount[];
  taxes?: ProductTax[];
  // Calculated values
  baseAmount?: number;
  salePrice?: number;
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
  // Product codes
  internalCode?: string | null;
  originalCode?: string | null;
  clientArticleCode?: string | null;
  code?: string | null;
  unitsPerBox?: number | null;
  // Fiscal
  cabys?: string | null;
  cabysDescription?: string | null;
  productTypeId?: number;
  unitId?: number;
  commercialUnitMeasure?: string | null;
  // Packaging
  isPackaged?: boolean;
  quantity?: number;
  unitPrice?: number;
  // Customs
  customsPart?: string | null;
  // Complex fields
  codes?: ProductCode[];
  discounts?: ProductDiscount[];
  taxes?: ProductTax[];
  // Calculated values
  baseAmount?: number;
  salePrice?: number;
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
  // Product codes
  internalCode: z.string().nullable().optional(),
  originalCode: z.string().nullable().optional(),
  clientArticleCode: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  unitsPerBox: z.number().min(0).nullable().optional(),
  // Fiscal
  cabys: z.string().nullable().optional(),
  cabysDescription: z.string().nullable().optional(),
  productTypeId: z.number().optional(),
  unitId: z.number().optional(),
  commercialUnitMeasure: z.string().nullable().optional(),
  // Packaging
  isPackaged: z.boolean().optional(),
  quantity: z.number().min(1).optional(),
  unitPrice: z.number().min(0).optional(),
  // Customs
  customsPart: z.string().nullable().optional(),
  // Complex fields
  codes: z.array(z.object({
    codeTypeId: z.number(),
    number: z.string(),
    description: z.string().optional(),
  })).optional(),
  discounts: z.array(z.object({
    discountTypeId: z.number(),
    percentage: z.number().optional(),
    amount: z.number().optional(),
    reason: z.string().optional(),
    isAmount: z.boolean().optional(),
  })).optional(),
  taxes: z.array(z.object({
    taxTypeId: z.number(),
    code: z.string().optional(),
    rate: z.number().optional(),
    amount: z.number().optional(),
    taxRateId: z.number().optional(),
    taxFactorId: z.number().optional(),
    factor: z.number().optional(),
    otherTaxType: z.string().optional(),
    specialFields: z.object({
      quantity: z.number().optional(),
      percentage: z.number().optional(),
      proportion: z.number().optional(),
      volumeConsumption: z.number().optional(),
      taxUnitAmount: z.number().optional(),
      taxAmountId: z.number().optional(),
    }).optional(),
    isAmount: z.boolean().optional(),
  })).optional(),
  // Calculated values
  baseAmount: z.number().optional(),
  salePrice: z.number().optional(),
});
