import { useQuery } from '@tanstack/react-query';
import { buildOrgApiUrl, buildOrdersApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import type { Product } from '@/models/Product';
import type { Category } from '@/models/Category';
import type { DeploymentHistory } from '@/models/Deployment';

export interface DashboardStats {
  productCount: number;
  categoryCount: number;
  orderCount: number;
  revenue: number;
}

export interface RecentProduct {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  createdAt: Date;
}

export interface RecentDeployment {
  id: string;
  buildId: string;
  status: string;
  message: string;
  completedAt: Date | null;
  deployUrl: string | null;
}

export function useDashboardStats(userId: string | undefined, orgId: string | undefined) {
  // Fetch products count (from orders API service with pagination)
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['dashboard-products', userId, orgId],
    queryFn: async () => {
      if (!userId || !orgId) return { totalElements: 0, data: [] };
      const url = buildOrdersApiUrl(orgId, '/products?page=1&pageSize=5');
      const response = await apiRequest('GET', url);
      const data = await response.json();
      return {
        totalElements: data.pagination?.totalElements ?? 0,
        data: data.data ?? []
      };
    },
    enabled: !!userId && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories count (from orders API service with pagination)
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['dashboard-categories', userId, orgId],
    queryFn: async () => {
      if (!userId || !orgId) return { totalElements: 0, data: [] };
      const url = buildOrdersApiUrl(orgId, '/categories?page=1&pageSize=1');
      const response = await apiRequest('GET', url);
      const data = await response.json();
      return {
        totalElements: data.pagination?.totalElements ?? 0,
        data: data.data ?? []
      };
    },
    enabled: !!userId && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch orders with processing and pending status
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['dashboard-orders', userId, orgId],
    queryFn: async () => {
      if (!userId || !orgId) return { orders: [], total: 0 };
      const search = '(orderStatus:processing,orderStatus:pending)';
      const url = buildOrdersApiUrl(orgId, `/orders?search=${encodeURIComponent(search)}`);
      const response = await apiRequest('GET', url);
      const data = await response.json();
      return { orders: data.data ?? [], total: data.pagination?.totalElements ?? 0 };
    },
    enabled: !!userId && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch deployments
  const { data: deployments = [], isLoading: isLoadingDeployments } = useQuery({
    queryKey: ['dashboard-deployments', userId, orgId],
    queryFn: async () => {
      if (!userId || !orgId) return [];
      const response = await apiRequest('GET', buildOrgApiUrl(userId, orgId, '/deployments/history'));
      const data = await response.json() as DeploymentHistory[];
      // Sort by date, most recent first
      return data.sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });
    },
    enabled: !!userId && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate stats
  const stats: DashboardStats = {
    productCount: productsData?.totalElements ?? 0,
    categoryCount: categoriesData?.totalElements ?? 0,
    orderCount: ordersData?.total ?? 0,
    revenue: 0, // Placeholder
  };

  // Get recent products (last 5) - fetch separately with larger page size if needed
  const recentProducts: RecentProduct[] = (productsData?.data || [] as any[])
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
    }));

  // Get recent deployments (last 5)
  const recentDeployments: RecentDeployment[] = deployments
    .slice(0, 5)
    .map(d => ({
      id: d.id,
      buildId: d.buildId,
      status: d.status,
      message: d.message,
      completedAt: d.completedAt,
      deployUrl: d.deployUrl,
    }));

  // Get latest deployment for status
  const latestDeployment = deployments[0] || null;

  return {
    stats,
    recentProducts,
    recentDeployments,
    latestDeployment,
    isLoading: isLoadingProducts || isLoadingCategories || isLoadingOrders || isLoadingDeployments,
  };
}
