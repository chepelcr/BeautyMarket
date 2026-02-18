import { useEffect } from 'react';
import { ShoppingBag, ArrowUpDown, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useOrders } from '@/hooks/useOrders';
import { useDebounce } from '@/hooks/useDebounce';
import { useOrderListStore } from '@/store/order-list-store';
import { buildOrderSearchString } from '@/lib/orderSearchBuilder';
import { OrderSearch } from '@/components/orders/OrderSearch';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderExcelUpload } from '@/components/orders/OrderExcelUpload';
import { Pagination } from '@/components/products/Pagination';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const queryClient = useQueryClient();

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

  // Build search string for the API
  const searchString = buildOrderSearchString({
    textSearch: debouncedSearch || undefined,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    creationStartDate: filters.creationStartDate,
    creationEndDate: filters.creationEndDate,
    sortBy,
    sortOrder,
  });

  // Fetch orders
  const {
    orders,
    total,
    totalPages,
    isLoading: ordersLoading,
  } = useOrders({
    userId: user?.id || '',
    orgId: organizationId || '',
    search: searchString || undefined,
    page,
    pageSize,
  });

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [
      'createdAt' | 'customerName' | 'deliveryDate',
      'asc' | 'desc'
    ];
    setSorting(newSortBy, newSortOrder);
  };

  const handleOrderClick = (documentNumber: string) => {
    navigate(`/admin/orders/${documentNumber}`);
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
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
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('orders.upload.button')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('orders.upload.title')}</DialogTitle>
              <DialogDescription>
                {t('orders.upload.description')}
              </DialogDescription>
            </DialogHeader>
            <OrderExcelUpload
              organizationId={organizationId}
              onUploadSuccess={handleUploadSuccess}
            />
          </DialogContent>
        </Dialog>
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
              <SelectItem value="deliveryDate-asc">{t('orders.sort.deliveryDateAsc')}</SelectItem>
              <SelectItem value="deliveryDate-desc">{t('orders.sort.deliveryDateDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders grid */}
      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
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
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.order_id}
                order={order}
                onClick={() => handleOrderClick(order.document_number)}
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
