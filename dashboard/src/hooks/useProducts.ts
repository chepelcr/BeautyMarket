import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import type { Product } from '@/models';
import type { ProductFilters } from '@/store/product-list-store';

const ORDERS_API_URL = import.meta.env.VITE_ORDERS_API_URL;

async function patchProductStatus(orgId: string, productId: string, status: number) {
  const response = await fetch(
    `${ORDERS_API_URL}/api/organizations/${orgId}/products/${productId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );
  if (!response.ok) throw new Error(`Failed to update product status: ${response.statusText}`);
  return response.json();
}

export interface ProductsQueryParams {
  userId: string;
  orgId: string;
  search?: string;
  filters?: ProductFilters;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch products with pagination, filtering, and sorting
 */
async function fetchProducts(params: ProductsQueryParams): Promise<ProductsResponse> {
  const { userId, orgId, search, filters, sortBy, sortOrder, page = 1, pageSize = 12 } = params;

  // Build query string
  const queryParams = new URLSearchParams();

  if (search) queryParams.append('search', search);
  if (filters?.categoryId) queryParams.append('categoryId', filters.categoryId);
  if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
  if (filters?.priceMin !== undefined) queryParams.append('priceMin', String(filters.priceMin));
  if (filters?.priceMax !== undefined) queryParams.append('priceMax', String(filters.priceMax));
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  queryParams.append('page', String(page));
  queryParams.append('pageSize', String(pageSize));

  const url = buildOrgApiUrl(userId, orgId, `/products?${queryParams.toString()}`);
  const response = await apiRequest('GET', url);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();

  // If backend doesn't support pagination yet, simulate it
  if (Array.isArray(data)) {
    const products = data as Product[];

    // Apply search filter
    let filtered = products;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters?.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters?.isActive !== undefined) {
      filtered = filtered.filter(p => p.isActive === filters.isActive);
    }
    if (filters?.priceMin !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.priceMin!);
    }
    if (filters?.priceMax !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.priceMax!);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'createdAt') {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        comparison = dateA - dateB;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedProducts = filtered.slice(start, start + pageSize);

    return {
      products: paginatedProducts,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  return data;
}

/**
 * Hook to fetch products with pagination, filtering, and sorting
 */
export function useProducts(params: ProductsQueryParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 30000, // 30 seconds
    enabled: !!params.userId && !!params.orgId,
  });

  // Mutation for bulk activate (status: 1)
  const activateMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      await Promise.all(productIds.map(id => patchProductStatus(params.orgId, id, 1)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Mutation for bulk deactivate (status: 2)
  const deactivateMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      await Promise.all(productIds.map(id => patchProductStatus(params.orgId, id, 2)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Mutation for bulk delete (status: 3)
  const deleteMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      await Promise.all(productIds.map(id => patchProductStatus(params.orgId, id, 3)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: query.data?.products || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    pageSize: query.data?.pageSize || 12,
    totalPages: query.data?.totalPages || 0,
    isLoading: query.isLoading,
    error: query.error,

    // Bulk operations
    activateProducts: activateMutation.mutateAsync,
    deactivateProducts: deactivateMutation.mutateAsync,
    deleteProducts: deleteMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
