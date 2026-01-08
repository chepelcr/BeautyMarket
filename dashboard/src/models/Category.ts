import {z} from "zod";

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    backgroundColor: string;
    buttonColor: string;
    image1Url: string | null;
    image2Url: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface InsertCategory {
    name: string;
    slug: string;
    description: string;
    backgroundColor: string;
    buttonColor: string;
    image1Url?: string | null;
    image2Url?: string | null;
    isActive?: boolean;
    sortOrder?: number;
}

export const insertCategorySchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    backgroundColor: z.string().min(1),
    buttonColor: z.string().min(1),
    image1Url: z.string().nullable().optional(),
    image2Url: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
});
