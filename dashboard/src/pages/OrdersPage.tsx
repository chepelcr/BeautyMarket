import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowUpDown } from 'lucide-react';
import { useLocation } from 'wouter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useDebounce } from '@/hooks/useDebounce';
import { useOrderListStore } from '@/store/order-list-store';
import { OrderSearch } from '@/components/orders/OrderSearch';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderCard } from '@/components/orders/OrderCard';
import { Pagination } from '@/components/products/Pagination';
import { useLanguage } from '@/contexts/LanguageContext';

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  // Get organization from localStorage
  const [organization, setOrganization] = useState<any>(null);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    const storedOrg = localStorage.getItem('selectedOrganization');
    if (storedOrg) {
      try {
        setOrganization(JSON.parse(storedOrg));
      } catch (error) {
        console.error('Failed to parse organization:', error);
        navigate('/organizations/select');
      }
    } else if (!authLoading && isAuthenticated) {
      navigate('/organizations/select');
    }
    setOrgLoading(false);
  }, [authLoading, isAuthenticated, navigate]);

  const organizationId = organization?.id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Order list store
  const {
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize,
    setSearchQuery,
    setFilters,
    setPage,
    setPageSize,
    setSorting,
  } = useOrderListStore();

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch orders
  const {
    orders,
    total,
    totalPages,
    isLoading: ordersLoading,
  } = useOrders({
    userId: user?.id || '',
    orgId: organizationId || '',
    search: debouncedSearch,
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [
      'createdAt' | 'customerName' | 'total',
      'asc' | 'desc'
    ];
    setSorting(newSortBy, newSortOrder);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Loading states
  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !organization || !organizationId) {
    return null;
  }

  const isLoading = ordersLoading;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('orders.title')}</h1>
          <p className="text-muted-foreground">
            {t('orders.subtitle')}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <OrderSearch value={searchQuery} onChange={setSearchQuery} />
        <div className="flex items-center gap-2 flex-wrap">
          <OrderFilters filters={filters} onFiltersChange={setFilters} />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">{t('orders.sort')}</span>
          </div>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">{t('orders.sort.newestFirst')}</SelectItem>
              <SelectItem value="createdAt-asc">{t('orders.sort.oldestFirst')}</SelectItem>
              <SelectItem value="customerName-asc">{t('orders.sort.customerAsc')}</SelectItem>
              <SelectItem value="customerName-desc">{t('orders.sort.customerDesc')}</SelectItem>
              <SelectItem value="total-asc">{t('orders.sort.totalAsc')}</SelectItem>
              <SelectItem value="total-desc">{t('orders.sort.totalDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] rounded-lg" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {debouncedSearch || Object.keys(filters).length > 0
              ? t('orders.noOrdersFound')
              : t('orders.noOrdersYet')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {debouncedSearch || Object.keys(filters).length > 0
              ? t('orders.noOrdersFoundDescription')
              : t('orders.noOrdersYetDescription')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => handleOrderClick(order.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
