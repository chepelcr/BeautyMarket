import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildOrdersApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import type { Product } from '@/models';
import type { ProductFilters } from '@/store/product-list-store';

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
 * Build search string for products API
 * Supports: name, description, categoryName, category, status, price, salePrice filters and sorting
 * Uses OR logic for text search (name, description, categoryName)
 */
function buildProductSearchString(params: {
  textSearch?: string;
  categoryId?: string;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  salePriceMin?: number;
  salePriceMax?: number;
  sortBy?: string;
  sortOrder?: string;
}): string {
  const filters: string[] = [];

  // Text search with OR logic across name, description, categoryName, and code
  // Uses parentheses for OR: (name:text,description:text,categoryName:text,code:text)
  if (params.textSearch) {
    const searchTerm = params.textSearch;
    // Automatic partial matching - no wildcards needed!
    // Code search without type prefix searches all code types
    filters.push(`(name:${searchTerm},description:${searchTerm},categoryName:${searchTerm},code:${searchTerm})`);
  }

  // Category filter (exact match by ID)
  if (params.categoryId) {
    filters.push(`categoryId:${params.categoryId}`);
  }

  // Status filter (isActive)
  if (params.isActive !== undefined) {
    filters.push(`status:${params.isActive ? '1' : '0'}`);
  }

  // Price filters
  if (params.priceMin !== undefined && params.priceMax !== undefined) {
    // Between range
    filters.push(`price:${params.priceMin}~${params.priceMax}`);
  } else if (params.priceMin !== undefined) {
    // Greater than
    filters.push(`price>${params.priceMin}`);
  } else if (params.priceMax !== undefined) {
    // Less than
    filters.push(`price<${params.priceMax}`);
  }

  // Sale price filters
  if (params.salePriceMin !== undefined && params.salePriceMax !== undefined) {
    // Between range
    filters.push(`salePrice:${params.salePriceMin}~${params.salePriceMax}`);
  } else if (params.salePriceMin !== undefined) {
    // Greater than
    filters.push(`salePrice>${params.salePriceMin}`);
  } else if (params.salePriceMax !== undefined) {
    // Less than
    filters.push(`salePrice<${params.salePriceMax}`);
  }

  // Sorting
  if (params.sortBy) {
    const direction = params.sortOrder === 'desc' ? '<' : '>';
    filters.push(`orderBy${direction}${params.sortBy}`);
  }

  return filters.join(',');
}

/**
 * Fetch products with pagination, filtering, and sorting
 */
async function fetchProducts(params: ProductsQueryParams): Promise<ProductsResponse> {
  const { orgId, search, filters, sortBy, sortOrder, page = 1, pageSize = 12 } = params;

  // Build query string
  const queryParams = new URLSearchParams();

  // Build search string with all filters
  const searchString = buildProductSearchString({
    textSearch: search,
    categoryId: filters?.categoryId,
    isActive: filters?.isActive,
    priceMin: filters?.priceMin,
    priceMax: filters?.priceMax,
    salePriceMin: filters?.salePriceMin,
    salePriceMax: filters?.salePriceMax,
    sortBy,
    sortOrder,
  });

  if (searchString) queryParams.append('search', searchString);
  queryParams.append('page', String(page));
  queryParams.append('pageSize', String(pageSize));

  const url = buildOrdersApiUrl(orgId, `/products?${queryParams.toString()}`);
  const response = await apiRequest('GET', url);
  const data = await response.json();

  // Handle the API response format: { data: [], pagination: {} }
  return {
    products: data.data || [],
    total: data.pagination?.totalElements || 0,
    page: data.pagination?.page || page,
    pageSize: data.pagination?.pageSize || pageSize,
    totalPages: data.pagination?.totalPages || 0,
  };
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

  // Mutation for create product
  const createMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const url = buildOrdersApiUrl(params.orgId, '/products');
      const response = await apiRequest('POST', url, productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-products'] });
    },
  });

  // Mutation for update product
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const url = buildOrdersApiUrl(params.orgId, `/products/${id}`);
      const response = await apiRequest('PUT', url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-products'] });
    },
  });

  // Mutation for update product status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const url = buildOrdersApiUrl(params.orgId, `/products/${id}`);
      const response = await apiRequest('PATCH', url, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-products'] });
    },
  });

  // Mutation for bulk delete
  const deleteMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const promises = productIds.map(id => {
        const url = buildOrdersApiUrl(params.orgId, `/products/${id}`);
        return apiRequest('DELETE', url);
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-products'] });
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

    // CRUD operations
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    updateProductStatus: updateStatusMutation.mutateAsync,
    deleteProducts: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook to fetch a product by code (used when inserting/updating products)
 * @param orgId - Organization ID
 * @param haciendaCode - Hacienda code type (01=Vendor, 02=Buyer, 03=Manufacturer, 04=Internal, 99=Other)
 * @param code - Product code number
 */
export function useProductByCode(orgId: string, haciendaCode: string, code: string) {
  return useQuery({
    queryKey: ['product-by-code', orgId, haciendaCode, code],
    queryFn: async () => {
      const url = buildOrdersApiUrl(orgId, `/codes/${haciendaCode}/products/${code}`);
      try {
        const response = await apiRequest('GET', url);
        return response.json() as Promise<Product>;
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('404')) return null;
        throw error;
      }
    },
    enabled: !!orgId && !!haciendaCode && !!code,
    staleTime: 30000,
  });
}
