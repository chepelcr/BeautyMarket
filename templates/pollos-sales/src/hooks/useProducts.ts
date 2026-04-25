import { useQuery } from "@tanstack/react-query";
import { ordersApi, ordersOrgPath } from "../lib/api";
import { useAuthContext } from "../contexts/AuthContext";
import { useOrganization } from "./useOrganization";
import type { Product, ProductListResponse } from "../types";

export type { Product } from "../types";

export function useProducts() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);

  return useQuery({
    queryKey: ["products", org?.id],
    enabled: !!user && !!org,
    staleTime: 1000 * 60 * 10,
    queryFn: () =>
      ordersApi.get<ProductListResponse>(ordersOrgPath(org!.id, "/products")),
  });
}
