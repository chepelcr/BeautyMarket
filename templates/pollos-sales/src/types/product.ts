/**
 * Product DTOs for Pollos Sales
 */

export interface Category {
  category_id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category?: Category;
  image_url: string | null;
  status: number; // 0 = inactive, 1 = active
  sku?: string | null;
  stock_quantity?: number;
  created_on?: Date;
  updated_on?: Date;
  emoji?: string; // For UI display
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
