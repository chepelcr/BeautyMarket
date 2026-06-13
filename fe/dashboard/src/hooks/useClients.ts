import { useQuery } from '@tanstack/react-query';
import { buildOrdersApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import type { Client } from '@/models';

export interface ClientsQueryParams {
  orgId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ClientsResponse {
  clients: Client[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function fetchClients(params: ClientsQueryParams): Promise<ClientsResponse> {
  const { orgId, search, page = 1, pageSize = 12 } = params;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  queryParams.append('page', String(page));
  queryParams.append('page_size', String(pageSize));

  const url = buildOrdersApiUrl(orgId, `/clients?${queryParams.toString()}`);
  const response = await apiRequest('GET', url);
  const data = await response.json();

  return {
    clients: data.data ?? [],
    total: data.pagination?.totalElements ?? 0,
    page: data.pagination?.page ?? page,
    pageSize: data.pagination?.pageSize ?? pageSize,
    totalPages: data.pagination?.totalPages ?? 1,
  };
}

export function useClients(params: ClientsQueryParams) {
  const query = useQuery({
    queryKey: ['clients', params],
    queryFn: () => fetchClients(params),
    staleTime: 30000,
    enabled: !!params.orgId,
  });

  return {
    clients: query.data?.clients || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    pageSize: query.data?.pageSize || 12,
    totalPages: query.data?.totalPages || 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}
