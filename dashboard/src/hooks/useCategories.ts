import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { listCategories } from '@/services/categoriesApi';
import type { CategoriesResponse } from '@/models/Category';

/**
 * Hook to fetch categories with React Query caching
 * Prevents duplicate API calls by using a shared query key
 */
export function useCategories(
  organizationId: string | undefined,
  page: number = 1,
  pageSize: number = 100,
  options?: Omit<UseQueryOptions<CategoriesResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['categories', organizationId, page, pageSize],
    queryFn: () => listCategories(organizationId!, page, pageSize),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
    ...options,
  });
}
