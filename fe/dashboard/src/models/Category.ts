import {z} from "zod";
import type { PaginationResponse } from "./Pagination";

// API Response type (from Orders service)
export interface Category {
    category_id: string;
    organization_id: string;
    name: string;
    slug: string;
    description: string;
    background_color: string;
    button_color: string;
    image_1_url: string | null;
    image_2_url: string | null;
    is_active: boolean;
    sort_order: number;
}

// Image DTO for uploads
export interface ImageDTO {
    data: string;           // Base64-encoded image data
    name?: string;          // Optional filename
    content_type: string;    // MIME type
}

// Create/Update request type
export interface InsertCategory {
    name?: string;
    slug?: string;
    description?: string;
    background_color?: string;
    button_color?: string;
    image_1?: ImageDTO;
    image_2?: ImageDTO;
    sort_order?: number;
}

// Update status request
export interface UpdateCategoryStatus {
    status: 0 | 1;  // 0 = inactive, 1 = active
}

// Paginated response
export interface CategoriesResponse {
    data: Category[];
    pagination: PaginationResponse;
}

export const insertCategorySchema = z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    background_color: z.string().min(1).optional(),
    button_color: z.string().min(1).optional(),
    image_1: z.object({
        data: z.string(),
        name: z.string().optional(),
        content_type: z.string(),
    }).optional(),
    image_2: z.object({
        data: z.string(),
        name: z.string().optional(),
        content_type: z.string(),
    }).optional(),
    sort_order: z.number().optional(),
});
