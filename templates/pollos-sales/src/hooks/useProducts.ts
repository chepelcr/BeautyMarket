import { useQuery } from "@tanstack/react-query";
import { api, orgPath } from "../lib/api";
import { useAuthContext } from "../contexts/AuthContext";

export interface Product {
  id: number;
  name: string;
  emoji: string;
  price: number;
  category: "Comida" | "Bebida";
  isActive: boolean;
  stock: number;
}

export function useProducts() {
  const { user, org } = useAuthContext();

  return useQuery({
    queryKey: ["products", org?.id],
    enabled: !!user && !!org,
    staleTime: 1000 * 60 * 10,
    queryFn: () =>
      api.get<Product[]>(orgPath(user!.userId, org!.id, "/products")),
  });
}
