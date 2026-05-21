/**
 * Product DTOs for POS System
 */

export interface Category {
  category_id: string;
  name: string;
}

export interface ProductTax {
  tax_type_id: number;
  tax_code?: string;
  rate: number;
  special_fields?: {
    quantity?: number;
    percentage?: number;
    tax_amount_id?: number;
    volume_consumption?: number;
  };
}

export interface ProductDiscount {
  discount_type_id: number;
  rate?: number;
  amount?: number;
}

export interface Product {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  category_id?: string;
  category?: Category;
  image_url: string | null;
  status: number; // 1 = active, 2 = inactive, 3 = deleted
  sku?: string | null;
  stock_quantity?: number;
  track_inventory?: boolean;
  low_stock_threshold?: number;
  units_per_box?: number;
  /** Canonical Hacienda unit-of-measure code ("Unid", "Sp", "kg", ...). */
  unit_measure?: string;
  /** Nested CABYS object returned by the BE — `{id, code, description?, ...}`. */
  cabys?: {
    id: string;
    code: string;
    description?: string | null;
    product_type_id?: number | null;
    tax_rate_id?: number | null;
    country_code?: string | null;
  } | null;
  codes?: Array<{
    code_type_id: string;
    number: string;
    description?: string;
  }>;
  taxes?: ProductTax[];
  discounts?: ProductDiscount[];
  created_on?: Date;
  updated_on?: Date;
}

export interface ProductListResponse {
  data: Product[];
  pagination?: {
    page: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
  };
}
