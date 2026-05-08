import { useQuery } from "@tanstack/react-query";
import { ordersApi, ordersOrgPath } from "../lib/api";
import { useAuthContext } from "../contexts/AuthContext";
import { useOrganization } from "./useOrganization";
import type { ProductListResponse } from "../types";

export type { Product } from "../types";

interface UseProductsOptions {
  search?: string;
  category_id?: string;
  page?: number;
  page_size?: number;
  enabled?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { search, category_id, page = 1, page_size = 24, enabled = true } = options;
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);

  const searchParts: string[] = ["status:1"];
  if (search?.trim()) searchParts.push(`name:*${search.trim()}*`);
  if (category_id) searchParts.push(`category_id:${category_id}`);
  const searchParam = searchParts.join(",");

  return useQuery({
    queryKey: ["products", org?.id, searchParam, page, page_size],
    enabled: !!user && !!org && enabled,
    staleTime: 1000 * 60 * 5,
    queryFn: () => {
      const params = new URLSearchParams({
        search: searchParam,
        page: String(page),
        page_size: String(page_size),
      });
      return ordersApi.get<ProductListResponse>(
        ordersOrgPath(org!.id, `/products?${params.toString()}`)
      );
    },
  });
}
