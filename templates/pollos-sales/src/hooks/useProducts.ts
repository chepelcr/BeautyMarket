import { useQuery } from "@tanstack/react-query";
import { ordersApi, ordersOrgPath } from "../lib/api";
import { useAuthContext } from "../contexts/AuthContext";
import { useOrganization } from "./useOrganization";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category?: {
    category_id: string;
    name: string;
  };
  image_url: string | null;
  status: number; // 0 = inactive, 1 = active
  sku?: string | null;
  stock_quantity?: number;
  created_on?: Date;
  updated_on?: Date;
}

export function useProducts() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);

  return useQuery({
    queryKey: ["products", org?.id],
    enabled: !!user && !!org,
    staleTime: 1000 * 60 * 10,
    queryFn: () =>
      ordersApi.get<Product[]>(ordersOrgPath(org!.id, "/products")),
  });
}
