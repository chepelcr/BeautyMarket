import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/orders-api';
import type { StoreResponse, StoreRequestDTO } from '@/models';

export interface StoresQueryParams {
  orgId: string;
  clientId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface StoresResponse {
  stores: StoreResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function fetchStores(params: StoresQueryParams): Promise<StoresResponse> {
  const { orgId, clientId, search, page = 1, pageSize = 12 } = params;
  ordersApi.setOrganization(orgId);
  const data = await ordersApi.listStores(clientId, { search, page, pageSize });
  return {
    stores: data.data ?? [],
    total: data.pagination?.totalElements ?? 0,
    page: data.pagination?.page ?? page,
    pageSize: data.pagination?.pageSize ?? pageSize,
    totalPages: data.pagination?.totalPages ?? 1,
  };
}

export function useStores(params: StoresQueryParams) {
  const query = useQuery({
    queryKey: ['stores', params],
    queryFn: () => fetchStores(params),
    staleTime: 30000,
    enabled: !!params.orgId && !!params.clientId,
  });

  return {
    stores: query.data?.stores || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    pageSize: query.data?.pageSize || 12,
    totalPages: query.data?.totalPages || 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useStoreMutations(orgId: string, clientId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['stores'] });

  const createStore = useMutation({
    mutationFn: (data: StoreRequestDTO) => {
      ordersApi.setOrganization(orgId);
      return ordersApi.createStore(clientId, data);
    },
    onSuccess: invalidate,
  });

  const updateStore = useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: StoreRequestDTO }) => {
      ordersApi.setOrganization(orgId);
      return ordersApi.updateStore(clientId, storeId, data);
    },
    onSuccess: invalidate,
  });

  const updateStoreStatus = useMutation({
    mutationFn: ({ storeId, status }: { storeId: string; status: number }) => {
      ordersApi.setOrganization(orgId);
      return ordersApi.updateStoreStatus(clientId, storeId, status);
    },
    onSuccess: invalidate,
  });

  const uploadStores = useMutation({
    mutationFn: ({ file, filename }: { file: string; filename: string }) => {
      ordersApi.setOrganization(orgId);
      return ordersApi.uploadStores(clientId, file, filename);
    },
    onSuccess: invalidate,
  });

  return { createStore, updateStore, updateStoreStatus, uploadStores };
}
