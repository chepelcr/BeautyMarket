import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Order } from '@/models';
import { OrderHeader } from '@/components/orders/OrderHeader';
import { OrderCustomerInfo } from '@/components/orders/OrderCustomerInfo';
import { OrderLineItems } from '@/components/orders/OrderLineItems';
import { OrderPaymentInfo } from '@/components/orders/OrderPaymentInfo';
import { OrderShippingInfo } from '@/components/orders/OrderShippingInfo';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';

export default function OrderDetailsPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
  const [, navigate] = useLocation();
  const [, params] = useRoute('/admin/orders/:documentNumber');
  const queryClient = useQueryClient();

  const organizationId = organization?.id;
  const documentNumber = params?.documentNumber;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch order details
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', documentNumber],
    enabled: !!user?.id && !!organizationId && !!documentNumber,
    queryFn: async () => {
      const url = `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/${documentNumber}`;
      const response = await apiRequest('GET', url);
      return response.json();
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const url = `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/${documentNumber}/status`;
      const response = await apiRequest('PUT', url, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', documentNumber] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Loading states
  if (authLoading || orgLoading) {
    return <PageLoader fullScreen={false} />;
  }

  if (!isAuthenticated || !organization || !organizationId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!documentNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('orders.details.notFound')}</h2>
          <p className="text-muted-foreground mb-4">{t('orders.details.notFoundDescription')}</p>
          <Button onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('orders.details.backToOrders')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/orders')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('orders.details.backToOrders')}
          </Button>
        </div>
      </div>

      {/* Order content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <OrderHeader
            order={order}
            organizationId={organizationId}
            documentNumber={documentNumber!}
            onReprocessSuccess={(updatedOrder) => {
              queryClient.setQueryData(['order', documentNumber], updatedOrder);
            }}
            onCrossdockingUploadSuccess={(updatedOrder) => {
              queryClient.setQueryData(['order', documentNumber], updatedOrder);
            }}
          />

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content - left side */}
            <div className="lg:col-span-2 space-y-6">
              <OrderLineItems order={order} />
              <OrderStatusTimeline order={order} />
            </div>

            {/* Sidebar - right side */}
            <div className="space-y-6">
              <OrderCustomerInfo order={order} />
              <OrderShippingInfo order={order} />
              <OrderPaymentInfo order={order} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
