import { useQuery } from '@tanstack/react-query';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import type { Order } from '@/models';

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrdersQueryParams {
  userId: string;
  orgId: string;
  search?: string;
  filters?: OrderFilters;
  sortBy?: string;
  sortOrder?: string;
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

/**
 * Fetch orders with pagination, filtering, and sorting
 */
async function fetchOrders(params: OrdersQueryParams): Promise<OrdersResponse> {
  const { userId, orgId, search, filters, sortBy, sortOrder, page = 1, pageSize = 12 } = params;

  // Build query string
  const queryParams = new URLSearchParams();

  if (search) queryParams.append('search', search);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  queryParams.append('page', String(page));
  queryParams.append('pageSize', String(pageSize));

  const url = buildOrgApiUrl(userId, orgId, `/orders?${queryParams.toString()}`);
  const response = await apiRequest('GET', url);

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await response.json();

  // If backend doesn't support pagination yet, simulate it
  if (Array.isArray(data)) {
    const orders = data as Order[];

    // Apply search filter
    let filtered = orders;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = orders.filter(o =>
        o.id.toLowerCase().includes(searchLower) ||
        o.customerName.toLowerCase().includes(searchLower) ||
        o.customerPhone.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters?.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(filters.startDate!));
    }
    if (filters?.endDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(filters.endDate!));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortBy === 'total') {
        comparison = a.total - b.total;
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
    const paginatedOrders = filtered.slice(start, start + pageSize);

    return {
      orders: paginatedOrders,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  return data;
}

/**
 * Hook to fetch orders with pagination, filtering, and sorting
 */
export function useOrders(params: OrdersQueryParams) {
  const query = useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
    staleTime: 30000, // 30 seconds
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
