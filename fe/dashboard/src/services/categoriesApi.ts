import { buildOrdersApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import type { Category, InsertCategory, CategoriesResponse } from '@/models/Category';

/**
 * Convert a File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid image type. Allowed: PNG, JPEG, GIF, WEBP',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size exceeds 5MB limit',
    };
  }

  return { valid: true };
}

/**
 * List categories with pagination
 */
export async function listCategories(
  organizationId: string,
  page: number = 1,
  pageSize: number = 12
): Promise<CategoriesResponse> {
  const url = buildOrdersApiUrl(organizationId, `/categories?page=${page}&pageSize=${pageSize}`);
  const response = await apiRequest('GET', url);
  return response.json();
}

/**
 * Get category by ID
 */
export async function getCategoryById(
  organizationId: string,
  categoryId: string
): Promise<Category> {
  const url = buildOrdersApiUrl(organizationId, `/categories/${categoryId}`);
  const response = await apiRequest('GET', url);
  return response.json();
}

/**
 * Create a new category
 */
export async function createCategory(
  organizationId: string,
  data: InsertCategory
): Promise<Category> {
  const url = buildOrdersApiUrl(organizationId, '/categories');
  const response = await apiRequest('POST', url, data);
  return response.json();
}

/**
 * Update an existing category
 */
export async function updateCategory(
  organizationId: string,
  categoryId: string,
  data: InsertCategory
): Promise<Category> {
  const url = buildOrdersApiUrl(organizationId, `/categories/${categoryId}`);
  const response = await apiRequest('PUT', url, data);
  return response.json();
}

/**
 * Update category status (active/inactive)
 */
export async function updateCategoryStatus(
  organizationId: string,
  categoryId: string,
  status: 0 | 1
): Promise<Category> {
  const url = buildOrdersApiUrl(organizationId, `/categories/${categoryId}`);
  const response = await apiRequest('PATCH', url, { status });
  return response.json();
}

/**
 * Delete a category
 */
export async function deleteCategory(
  organizationId: string,
  categoryId: string
): Promise<void> {
  const url = buildOrdersApiUrl(organizationId, `/categories/${categoryId}`);
  await apiRequest('DELETE', url);
}
