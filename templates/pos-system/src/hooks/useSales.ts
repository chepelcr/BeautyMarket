import { useQuery } from '@tanstack/react-query';
import { salesApi, salesOrgPath } from '@/lib/api';
import type { SaleListResponse } from '@/types/invoice';
import type { ComplexSearchFilters } from '@/types/document';

interface UseSalesParams {
  orgId: string;
  document_types?: number[];
  issued?: boolean;
  search?: ComplexSearchFilters;
  page?: number;
  size?: number;
  enabled?: boolean;
}

export function useSales({
  orgId,
  document_types,
  issued,
  search,
  page = 0,
  size = 20,
  enabled = true,
}: UseSalesParams) {
  const params = new URLSearchParams();
  if (document_types?.length) params.set('document_types', document_types.join(','));
  if (issued !== undefined) params.set('issued', String(issued));
  if (search && Object.keys(search).some((k) => (search as any)[k] !== undefined)) {
    params.set('search', encodeURIComponent(JSON.stringify(search)));
  }
  params.set('page', String(page));
  params.set('size', String(size));

  const queryString = params.toString();
  const path = salesOrgPath(orgId, queryString ? `?${queryString}` : '');

  return useQuery<SaleListResponse>({
    queryKey: ['sales', orgId, document_types, issued, search, page, size],
    queryFn: () => salesApi.get<SaleListResponse>(path),
    enabled: enabled && !!orgId,
  });
}
