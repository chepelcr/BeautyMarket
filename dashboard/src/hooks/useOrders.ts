import { useQuery } from '@tanstack/react-query';
import type { Order } from '@/models';

export interface OrdersQueryParams {
  userId: string;
  orgId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function fetchOrders(params: OrdersQueryParams): Promise<OrdersResponse> {
  const { orgId, search, page = 1, pageSize = 12 } = params;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  queryParams.append('page', String(page));
  queryParams.append('pageSize', String(pageSize));

  const url = `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${orgId}/orders?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await response.json();

  return {
    orders: data.data ?? [],
    total: data.pagination?.totalElements ?? 0,
    page: data.pagination?.page ?? page,
    pageSize: data.pagination?.pageSize ?? pageSize,
    totalPages: data.pagination?.totalPages ?? 1,
  };
}

export function useOrders(params: OrdersQueryParams) {
  const query = useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
    staleTime: 30000,
    enabled: !!params.userId && !!params.orgId,
  });

  return {
    orders: query.data?.orders || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    pageSize: query.data?.pageSize || 12,
    totalPages: query.data?.totalPages || 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}
