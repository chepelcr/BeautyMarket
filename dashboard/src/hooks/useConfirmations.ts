import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildOrdersApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import type { Confirmation } from '@/models';

export interface ConfirmationsQueryParams {
  userId: string;
  orgId: string;
  page?: number;
  pageSize?: number;
}

export interface ConfirmationsResponse {
  confirmations: Confirmation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const baseUrl = (orgId: string) => buildOrdersApiUrl(orgId, '/confirmations');

async function fetchConfirmations(params: ConfirmationsQueryParams): Promise<ConfirmationsResponse> {
  const { orgId, page = 1, pageSize = 12 } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('page', String(page));
  queryParams.append('pageSize', String(pageSize));

  const response = await apiRequest('GET', `${baseUrl(orgId)}?${queryParams.toString()}`);
  const data = await response.json();

  return {
    confirmations: data.data ?? [],
    total: data.pagination?.totalElements ?? 0,
    page: data.pagination?.page ?? page,
    pageSize: data.pagination?.pageSize ?? pageSize,
    totalPages: data.pagination?.totalPages ?? 1,
  };
}

export function useConfirmations(params: ConfirmationsQueryParams) {
  const query = useQuery({
    queryKey: ['confirmations', params],
    queryFn: () => fetchConfirmations(params),
    staleTime: 30000,
    enabled: !!params.userId && !!params.orgId,
  });

  return {
    confirmations: query.data?.confirmations || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    pageSize: query.data?.pageSize || 12,
    totalPages: query.data?.totalPages || 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useConfirmation(orgId: string, confirmationNumber: string) {
  return useQuery<Confirmation>({
    queryKey: ['confirmation', confirmationNumber],
    queryFn: async () => {
      const response = await apiRequest('GET', `${baseUrl(orgId)}/${confirmationNumber}`);
      return response.json();
    },
    enabled: !!orgId && !!confirmationNumber,
  });
}

export function useCreateConfirmation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { confirmation_number: string; document_numbers: string[] }) => {
      const response = await apiRequest('POST', baseUrl(orgId), body);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations'] });
    },
  });
}

export function useUpdateConfirmation(orgId: string, confirmationNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { document_numbers: string[] }) => {
      const response = await apiRequest('PUT', `${baseUrl(orgId)}/${confirmationNumber}`, body);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['confirmation', confirmationNumber] });
    },
  });
}

export function useUpdateConfirmationStatus(orgId: string, confirmationNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: number) => {
      const response = await apiRequest('PATCH', `${baseUrl(orgId)}/${confirmationNumber}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['confirmation', confirmationNumber] });
    },
  });
}

export function useRemoveOrderFromConfirmation(orgId: string, confirmationNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentNumber: string) => {
      const response = await apiRequest('DELETE', `${baseUrl(orgId)}/${confirmationNumber}/orders/${documentNumber}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['confirmation', confirmationNumber] });
    },
  });
}
