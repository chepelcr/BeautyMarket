import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const baseUrl = (orgId: string) =>
  `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${orgId}/confirmations`;

async function fetchConfirmations(params: ConfirmationsQueryParams): Promise<ConfirmationsResponse> {
  const { orgId, page = 1, pageSize = 12 } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('page', String(page));
  queryParams.append('pageSize', String(pageSize));

  const response = await fetch(`${baseUrl(orgId)}?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch confirmations');
  }

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
      const response = await fetch(`${baseUrl(orgId)}/${confirmationNumber}`);
      if (!response.ok) throw new Error('Failed to fetch confirmation');
      return response.json();
    },
    enabled: !!orgId && !!confirmationNumber,
  });
}

export function useCreateConfirmation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { confirmation_number: string; document_numbers: string[] }) => {
      const response = await fetch(baseUrl(orgId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to create confirmation (${response.status})`);
      }
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
      const response = await fetch(`${baseUrl(orgId)}/${confirmationNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to update confirmation (${response.status})`);
      }
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
      const response = await fetch(`${baseUrl(orgId)}/${confirmationNumber}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to update status (${response.status})`);
      }
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
      const response = await fetch(
        `${baseUrl(orgId)}/${confirmationNumber}/orders/${documentNumber}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to remove order (${response.status})`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['confirmation', confirmationNumber] });
    },
  });
}
