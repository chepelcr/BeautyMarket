import { z } from "zod";

export interface ProductCode {
  code_type_id: string;
  number: string;
  description?: string;
}

export interface ProductDiscount {
  discount_type: string;
  percentage?: number;
  amount?: number;
  reason?: string;
}

export interface TaxSpecialFields {
  quantity?: number;
  percentage?: number;
  proportion?: number;
  volume_consumption?: number;
  tax_unit_amount?: number;
  tax_amount_id?: number;
}

export interface ProductTax {
  tax_type: string;
  tax_type_code?: string; // Code-based field for tax type
  tax_rate_code?: string; // Code-based field for tax rate
  tax_factor_code?: string; // Code-based field for tax factor
  rate?: number;
  amount?: number;
  tax_rate_id?: number;
  tax_factor_id?: number;
  factor?: number;
  other_tax_type?: string;
  special_fields?: TaxSpecialFields;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category?: {
    category_id: string;
    name: string;
  };
  image_url: string | null;
  status: number;
  // Inventory tracking fields
  sku?: string | null;
  stock_quantity?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  has_fiscal_info?: boolean;
  // Product codes
  internal_code?: string | null;
  original_code?: string | null;
  client_article_code?: string | null;
  code?: string | null;
  units_per_box?: number | null;
  // Fiscal
  cabys?: string | null;
  cabys_description?: string | null;
  product_type_id?: number;
  unit_id?: number;
  commercial_unit_measure?: string | null;
  // Packaging
  has_package_info?: boolean;
  is_packaged?: boolean;
  quantity?: number;
  unit_price?: number;
  // Customs
  customs_part?: string | null;
  // Complex fields (stored as JSON)
  codes?: ProductCode[];
  discounts?: ProductDiscount[];
  taxes?: ProductTax[];
  // Calculated values
  base_amount?: number;
  sale_price?: number;
  on_sale?: boolean;
  original_price?: number;
  is_service?: boolean;
  created_on: Date;
  updated_on: Date;
}

export interface InsertProduct {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string | null;
  status?: number;
  // Inventory tracking fields
  sku?: string | null;
  stock_quantity?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  has_fiscal_info?: boolean;
  // Product codes
  internal_code?: string | null;
  original_code?: string | null;
  client_article_code?: string | null;
  code?: string | null;
  units_per_box?: number | null;
  // Fiscal
  cabys?: string | null;
  cabys_description?: string | null;
  product_type_id?: number;
  unit_id?: number;
  commercial_unit_measure?: string | null;
  // Packaging
  has_package_info?: boolean;
  is_packaged?: boolean;
  quantity?: number;
  unit_price?: number;
  // Customs
  customs_part?: string | null;
  // Complex fields
  codes?: ProductCode[];
  discounts?: ProductDiscount[];
  taxes?: ProductTax[];
  // Calculated values
  base_amount?: number;
  sale_price?: number;
}

export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  category_id: z.string().min(1),
  image_url: z.string().nullable().optional(),
  status: z.number().optional(),
  // Inventory tracking fields
  sku: z.string().nullable().optional(),
  stock_quantity: z.number().min(0).optional(),
  low_stock_threshold: z.number().min(0).optional(),
  track_inventory: z.boolean().optional(),
  has_fiscal_info: z.boolean().optional(),
  // Product codes
  internal_code: z.string().nullable().optional(),
  original_code: z.string().nullable().optional(),
  client_article_code: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  units_per_box: z.number().min(0).nullable().optional(),
  // Fiscal
  cabys: z.string().nullable().optional(),
  cabys_description: z.string().nullable().optional(),
  product_type_id: z.number().optional(),
  unit_id: z.number().optional(),
  commercial_unit_measure: z.string().nullable().optional(),
  // Packaging
  has_package_info: z.boolean().optional(),
  is_packaged: z.boolean().optional(),
  quantity: z.number().min(1).optional(),
  unit_price: z.number().min(0).optional(),
  // Customs
  customs_part: z.string().nullable().optional(),
  // Complex fields
  codes: z.array(z.object({
    code_type_id: z.number(),
    number: z.string(),
    description: z.string().optional(),
  })).optional(),
  discounts: z.array(z.object({
    discount_type_id: z.number(),
    percentage: z.number().optional(),
    amount: z.number().optional(),
    reason: z.string().optional(),
    is_amount: z.boolean().optional(),
  })).optional(),
  taxes: z.array(z.object({
    tax_type_id: z.number(),
    code: z.string().optional(),
    rate: z.number().optional(),
    amount: z.number().optional(),
    tax_rate_id: z.number().optional(),
    tax_factor_id: z.number().optional(),
    factor: z.number().optional(),
    other_tax_type: z.string().optional(),
    special_fields: z.object({
      quantity: z.number().optional(),
      percentage: z.number().optional(),
      proportion: z.number().optional(),
      volume_consumption: z.number().optional(),
      tax_unit_amount: z.number().optional(),
      tax_amount_id: z.number().optional(),
    }).optional(),
    is_amount: z.boolean().optional(),
  })).optional(),
  // Calculated values
  base_amount: z.number().optional(),
  sale_price: z.number().optional(),
});
