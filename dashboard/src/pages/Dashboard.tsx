import { useLocation } from 'wouter';
import { PageLoader } from '@/components/ui/page-loader';
import {
  Package,
  Grid3X3,
  ShoppingCart,
  DollarSign,
  Rocket,
  FileText,
  Package2,
  Settings,
  Users,
  LayoutGrid,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  WelcomeCard,
  StatCard,
  StatusCard,
  RecentActivityCard,
  QuickActionsGrid,
} from '@/components/dashboard';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { useUserOrganizations } = useOrganization();
  const { data: organizations } = useUserOrganizations(user?.id);
  const organization = organizations?.[0];
  const { t } = useLanguage();

  const { stats, recentProducts, recentDeployments, latestDeployment, isLoading } =
    useDashboardStats(user?.id, organization?.id);

  if (!user || !organization) {
    return <PageLoader fullScreen={false} />;
  }

  // Determine deployment status
  const getDeploymentStatus = () => {
    if (!latestDeployment) return { status: 'info' as const, message: t('dashboard.deployment.noDeployments') };

    switch (latestDeployment.status.toLowerCase()) {
      case 'completed':
      case 'success':
        return { status: 'success' as const, message: latestDeployment.message || t('dashboard.deployment.latestSuccess') };
      case 'failed':
      case 'error':
        return { status: 'error' as const, message: latestDeployment.message || t('dashboard.deployment.latestFailed') };
      case 'pending':
      case 'building':
        return { status: 'pending' as const, message: latestDeployment.message || t('dashboard.deployment.inProgress') };
      default:
        return { status: 'warning' as const, message: latestDeployment.message || t('dashboard.deployment.unknownStatus') };
    }
  };

  const deploymentStatus = getDeploymentStatus();

  // Determine content status (whether there are products and categories)
  const getContentStatus = () => {
    if (stats.productCount === 0 && stats.categoryCount === 0) {
      return { status: 'warning' as const, message: t('dashboard.content.noProductsOrCategories') };
    }
    if (stats.productCount === 0) {
      return { status: 'warning' as const, message: t('dashboard.content.noProducts') };
    }
    if (stats.categoryCount === 0) {
      return { status: 'warning' as const, message: t('dashboard.content.noCategories') };
    }
    const productText = stats.productCount === 1 ? t('dashboard.content.product') : t('dashboard.content.products');
    const categoryText = stats.categoryCount === 1 ? t('dashboard.content.category') : t('dashboard.content.categories');
    return { status: 'success' as const, message: `${stats.productCount} ${productText} ${t('dashboard.content.in')} ${stats.categoryCount} ${categoryText}` };
  };

  const contentStatus = getContentStatus();

  // Inventory status (based on active products)
  const getInventoryStatus = () => {
    if (stats.productCount === 0) {
      return { status: 'info' as const, message: t('dashboard.inventory.noInventory') };
    }
    const productText = stats.productCount === 1 ? t('dashboard.content.product') : t('dashboard.content.products');
    return { status: 'success' as const, message: `${stats.productCount} ${productText} ${t('dashboard.inventory.inInventory')}` };
  };

  const inventoryStatus = getInventoryStatus();

  // Quick actions
  const quickActions = [
    {
      id: 'add-product',
      label: t('dashboard.quickActions.addProduct'),
      description: t('dashboard.quickActions.addProductDesc'),
      icon: Package2,
      onClick: () => setLocation('/admin/products'),
    },
    {
      id: 'add-category',
      label: t('dashboard.quickActions.addCategory'),
      description: t('dashboard.quickActions.addCategoryDesc'),
      icon: Grid3X3,
      onClick: () => setLocation('/admin/categories'),
    },
    {
      id: 'manage-content',
      label: t('dashboard.quickActions.manageContent'),
      description: t('dashboard.quickActions.manageContentDesc'),
      icon: FileText,
      onClick: () => setLocation('/admin/content'),
    },
    {
      id: 'view-deployments',
      label: t('dashboard.quickActions.viewDeployments'),
      description: t('dashboard.quickActions.viewDeploymentsDesc'),
      icon: Rocket,
      onClick: () => setLocation('/admin/deployments'),
    },
    {
      id: 'settings',
      label: t('dashboard.quickActions.settings'),
      description: t('dashboard.quickActions.settingsDesc'),
      icon: Settings,
      onClick: () => setLocation('/admin/settings/general'),
    },
    {
      id: 'invite-member',
      label: t('dashboard.quickActions.inviteMember'),
      description: t('dashboard.quickActions.inviteMemberDesc'),
      icon: Users,
      onClick: () => setLocation('/admin/members'),
    },
  ];

  // Recent products activity
  const recentProductsActivity = recentProducts.map((product) => ({
    id: product.id,
    title: product.name,
    subtitle: `$${product.price.toFixed(2)}`,
    timestamp: product.createdAt,
    icon: Package,
  }));

  // Recent deployments activity
  const recentDeploymentsActivity = recentDeployments.map((deployment) => {
    const getBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
          return 'default';
        case 'failed':
        case 'error':
          return 'destructive';
        case 'pending':
        case 'building':
          return 'secondary';
        default:
          return 'outline';
      }
    };

    return {
      id: deployment.id,
      title: deployment.buildId,
      subtitle: deployment.message || t('dashboard.deployment.noMessage'),
      badge: {
        label: deployment.status,
        variant: getBadgeVariant(deployment.status),
      },
      timestamp: deployment.completedAt || undefined,
      icon: Rocket,
    };
  });

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <WelcomeCard
        userName={user.firstName || user.username}
        organizationName={organization.name}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.stats.totalProducts')}
          value={stats.productCount}
          icon={Package}
          isLoading={isLoading}
          description={t('dashboard.stats.activeProducts')}
          onClick={() => setLocation('/admin/products')}
        />
        <StatCard
          title={t('dashboard.stats.activeCategories')}
          value={stats.categoryCount}
          icon={LayoutGrid}
          isLoading={isLoading}
          description={t('dashboard.stats.productCategories')}
          onClick={() => setLocation('/admin/categories')}
        />
        <StatCard
          title={t('dashboard.stats.orders')}
          value={stats.orderCount}
          icon={ShoppingCart}
          isLoading={isLoading}
          description={t('dashboard.stats.pendingOrders')}
          onClick={() => setLocation('/admin/orders')}
        />
        <StatCard
          title={t('dashboard.stats.revenue')}
          value={`$${stats.revenue.toFixed(2)}`}
          icon={DollarSign}
          isLoading={isLoading}
          description={t('dashboard.stats.comingSoon')}
        />
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title={t('dashboard.status.deployment')}
          status={deploymentStatus.status}
          icon={Rocket}
          message={deploymentStatus.message}
          timestamp={latestDeployment?.completedAt || undefined}
          isLoading={isLoading}
        />
        <StatusCard
          title={t('dashboard.status.content')}
          status={contentStatus.status}
          icon={FileText}
          message={contentStatus.message}
          isLoading={isLoading}
        />
        <StatusCard
          title={t('dashboard.status.inventory')}
          status={inventoryStatus.status}
          icon={Package}
          message={inventoryStatus.message}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivityCard
          title={t('dashboard.recentProducts')}
          items={recentProductsActivity}
          isLoading={isLoading}
          emptyMessage={t('dashboard.emptyProducts')}
          onItemClick={() => setLocation('/admin/products')}
        />
        <RecentActivityCard
          title={t('dashboard.recentDeployments')}
          items={recentDeploymentsActivity}
          isLoading={isLoading}
          emptyMessage={t('dashboard.emptyDeployments')}
          onItemClick={() => setLocation('/admin/deployments')}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.quickActions.title')}</h3>
        <QuickActionsGrid actions={quickActions} columns={3} />
      </div>
    </div>
  );
}
