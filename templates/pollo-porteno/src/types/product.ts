/**
 * Product DTOs - identical shape to the POS System template so the
 * storefront and POS share the same product/menu contract.
 */

export interface Category {
  category_id: string;
  name: string;
}

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category?: Category;
  image_url: string | null;
  status: number; // 1 = active, 2 = inactive, 3 = deleted
  sku?: string | null;
  stock_quantity?: number;
  track_inventory?: boolean;
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
