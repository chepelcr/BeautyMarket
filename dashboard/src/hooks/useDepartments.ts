import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/orders-api';
import type { DepartmentResponse, CreateDepartmentDTO, UpdateDepartmentDTO } from '@/models';

export interface DepartmentsQueryParams {
  orgId: string;
  clientId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface DepartmentsResponse {
  departments: DepartmentResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function fetchDepartments(params: DepartmentsQueryParams): Promise<DepartmentsResponse> {
  const { orgId, clientId, search, page = 1, pageSize = 12 } = params;
  ordersApi.setOrganization(orgId);
  const data = await ordersApi.listDepartments(clientId, { search, page, pageSize });
  return {
    departments: data.data ?? [],
    total: data.pagination?.totalElements ?? 0,
    page: data.pagination?.page ?? page,
    pageSize: data.pagination?.pageSize ?? pageSize,
    totalPages: data.pagination?.totalPages ?? 1,
  };
}

export function useDepartments(params: DepartmentsQueryParams) {
  const query = useQuery({
    queryKey: ['departments', params],
    queryFn: () => fetchDepartments(params),
    staleTime: 30000,
    enabled: !!params.orgId && !!params.clientId,
  });

  return {
    departments: query.data?.departments || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    pageSize: query.data?.pageSize || 12,
    totalPages: query.data?.totalPages || 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useDepartmentMutations(orgId: string, clientId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['departments'] });

  const createDepartment = useMutation({
    mutationFn: (data: CreateDepartmentDTO) => {
      ordersApi.setOrganization(orgId);
      return ordersApi.createDepartment(clientId, data);
    },
    onSuccess: invalidate,
  });

  const updateDepartment = useMutation({
    mutationFn: ({ departmentId, data }: { departmentId: string; data: UpdateDepartmentDTO }) => {
      ordersApi.setOrganization(orgId);
      return ordersApi.updateDepartment(clientId, departmentId, data);
    },
    onSuccess: invalidate,
  });

  const updateDepartmentStatus = useMutation({
    mutationFn: ({ departmentId, status }: { departmentId: string; status: number }) => {
      ordersApi.setOrganization(orgId);
      return ordersApi.updateDepartmentStatus(clientId, departmentId, status);
    },
    onSuccess: invalidate,
  });

  const deleteDepartment = useMutation({
    mutationFn: (departmentId: string) => {
      ordersApi.setOrganization(orgId);
      return ordersApi.deleteDepartment(clientId, departmentId);
    },
    onSuccess: invalidate,
  });

  return { createDepartment, updateDepartment, updateDepartmentStatus, deleteDepartment };
}
