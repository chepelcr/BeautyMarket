import { useQuery } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import type { Product } from '@/models/Product';
import type { Category } from '@/models/Category';
import type { DeploymentHistory } from '@/models/Deployment';

async function authenticatedRequest(url: string): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (error) {
    console.warn('No auth session available');
  }

  return fetch(url, { method: 'GET', headers });
}

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
  // Fetch products count
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['dashboard-products', userId, orgId],
    queryFn: async () => {
      if (!userId || !orgId) return [];
      const response = await authenticatedRequest(
        buildOrgApiUrl(userId, orgId, '/products')
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<Product[]>;
    },
    enabled: !!userId && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories count
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['dashboard-categories', userId, orgId],
    queryFn: async () => {
      if (!userId || !orgId) return [];
      const response = await authenticatedRequest(
        buildOrgApiUrl(userId, orgId, '/categories')
      );
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json() as Promise<Category[]>;
    },
    enabled: !!userId && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch deployments
  const { data: deployments = [], isLoading: isLoadingDeployments } = useQuery({
    queryKey: ['dashboard-deployments', userId, orgId],
    queryFn: async () => {
      if (!userId || !orgId) return [];
      const response = await authenticatedRequest(
        buildOrgApiUrl(userId, orgId, '/deployments/history')
      );
      if (!response.ok) throw new Error('Failed to fetch deployments');
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
    productCount: products.length,
    categoryCount: categories.length,
    orderCount: 0, // Placeholder
    revenue: 0, // Placeholder
  };

  // Get recent products (last 5)
  const recentProducts: RecentProduct[] = products
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(p => ({
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
    isLoading: isLoadingProducts || isLoadingCategories || isLoadingDeployments,
  };
}
