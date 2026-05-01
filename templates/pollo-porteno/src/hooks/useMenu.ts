import { useQuery } from '@tanstack/react-query';
import { storefrontApi } from '@/services/storefrontApi';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { Product, Category } from '@/types';
import { BRAND } from '@/lib/brand';

export function useMenu() {
  const { organizationId, isConfigLoading } = useOrganization();

  const productsQuery = useQuery({
    queryKey: ['products', organizationId],
    queryFn: () => storefrontApi.getProducts(organizationId!, { status: 1 }),
    enabled: !!organizationId,
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', organizationId],
    queryFn: () => storefrontApi.getCategories(organizationId!),
    enabled: !!organizationId,
  });

  const products: Product[] =
    productsQuery.data?.data ?? (organizationId ? [] : (BRAND.fallbackMenu as unknown as Product[]));

  const categories: Category[] =
    categoriesQuery.data ??
    (organizationId
      ? []
      : Array.from(
          new Map(
            (BRAND.fallbackMenu as unknown as Product[])
              .map((p) => p.category)
              .filter((c): c is Category => !!c)
              .map((c) => [c.category_id, c])
          ).values()
        ));

  return {
    products,
    categories,
    isLoading: isConfigLoading || productsQuery.isLoading || categoriesQuery.isLoading,
    error: (productsQuery.error || categoriesQuery.error) as Error | null,
    isFromApi: !!organizationId && !productsQuery.isLoading,
  };
}
