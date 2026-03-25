import {z} from "zod";

// API Response type (from Orders service)
export interface Category {
    categoryId: string;
    organizationId: string;
    name: string;
    slug: string;
    description: string;
    backgroundColor: string;
    buttonColor: string;
    image1Url: string | null;
    image2Url: string | null;
    isActive: boolean;
    sortOrder: number;
}

// Image DTO for uploads
export interface ImageDTO {
    data: string;           // Base64-encoded image data
    name?: string;          // Optional filename
    contentType: string;    // MIME type
}

// Create/Update request type
export interface InsertCategory {
    name?: string;
    slug?: string;
    description?: string;
    backgroundColor?: string;
    buttonColor?: string;
    image1?: ImageDTO;
    image2?: ImageDTO;
    sortOrder?: number;
}

// Update status request
export interface UpdateCategoryStatus {
    status: 0 | 1;  // 0 = inactive, 1 = active
}

// Paginated response
export interface CategoriesResponse {
    data: Category[];
    pagination: {
        page: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
    };
}

export const insertCategorySchema = z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    backgroundColor: z.string().min(1).optional(),
    buttonColor: z.string().min(1).optional(),
    image1: z.object({
        data: z.string(),
        name: z.string().optional(),
        contentType: z.string(),
    }).optional(),
    image2: z.object({
        data: z.string(),
        name: z.string().optional(),
        contentType: z.string(),
    }).optional(),
    sortOrder: z.number().optional(),
});
