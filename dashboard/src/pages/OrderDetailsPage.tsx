import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import type { Order } from '@/models';
import { OrderHeader } from '@/components/orders/OrderHeader';
import { OrderCustomerInfo } from '@/components/orders/OrderCustomerInfo';
import { OrderLineItems } from '@/components/orders/OrderLineItems';
import { OrderPaymentInfo } from '@/components/orders/OrderPaymentInfo';
import { OrderShippingInfo } from '@/components/orders/OrderShippingInfo';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { OrderActions } from '@/components/orders/OrderActions';

export default function OrderDetailsPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute('/admin/orders/:orderId');
  const queryClient = useQueryClient();

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
  const orderId = params?.orderId;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch order details
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', orderId],
    enabled: !!user?.id && !!organizationId && !!orderId,
    queryFn: async () => {
      const url = buildOrgApiUrl(user!.id, organizationId, `/orders/${orderId}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      return response.json();
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const url = buildOrgApiUrl(user!.id, organizationId, `/orders/${orderId}/status`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleStatusUpdate = (status: string) => {
    updateStatusMutation.mutate({ status });
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

  if (isLoading) {
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
            onStatusUpdate={handleStatusUpdate}
            isUpdating={updateStatusMutation.isPending}
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
              <OrderActions
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
