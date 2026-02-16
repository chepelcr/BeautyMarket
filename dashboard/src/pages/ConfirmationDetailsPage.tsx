import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import {
  ArrowLeft,
  Loader2,
  MoreVertical,
  ArrowRight,
  XCircle,
  Plus,
  Send,
  MapPin,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  useConfirmation,
  useUpdateConfirmationStatus,
  useRemoveOrderFromConfirmation,
} from '@/hooks/useConfirmations';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { AddOrdersDialog } from '@/components/confirmations/AddOrdersDialog';

export default function ConfirmationDetailsPage() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute('/admin/confirmations/:confirmationNumber');

  const [organization, setOrganization] = useState<any>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [addOrdersOpen, setAddOrdersOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToRemove, setOrderToRemove] = useState<string | null>(null);

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const organizationId = organization?.id;
  const confirmationNumber = params?.confirmationNumber || '';

  const { data: confirmation, isLoading, error } = useConfirmation(
    organizationId || '',
    confirmationNumber
  );

  const statusMutation = useUpdateConfirmationStatus(organizationId || '', confirmationNumber);
  const removeOrderMutation = useRemoveOrderFromConfirmation(organizationId || '', confirmationNumber);

  const statusMap: Record<string, number> = {
    pending: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 5,
  };

  const nextStatusMap: Record<string, string> = {
    pending: 'processing',
    processing: 'shipped',
    shipped: 'delivered',
  };

  const currentStatus = confirmation?.confirmation_status || '';
  const nextStatus = nextStatusMap[currentStatus];
  const canAdvance = !!nextStatus;
  const canCancel = currentStatus !== 'delivered' && currentStatus !== 'cancelled';

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await statusMutation.mutateAsync(statusMap[newStatus]);
      toast({ title: t('confirmations.status.updateSuccess') });
    } catch (error) {
      toast({
        title: t('confirmations.status.updateError'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    }
    setShowCancelConfirm(false);
  };

  const handleRemoveOrder = async (documentNumber: string) => {
    try {
      await removeOrderMutation.mutateAsync(documentNumber);
      toast({ title: t('confirmations.removeOrder.success') });
    } catch (error) {
      toast({
        title: t('confirmations.removeOrder.error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    }
    setOrderToRemove(null);
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString(language === 'es' ? 'es-CR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpdating = statusMutation.isPending || removeOrderMutation.isPending;

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

  if (error || !confirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('confirmations.details.notFound')}</h2>
          <p className="text-muted-foreground mb-4">{t('confirmations.details.notFoundDescription')}</p>
          <Button onClick={() => navigate('/admin/confirmations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('confirmations.details.backToList')}
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
            onClick={() => navigate('/admin/confirmations')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('confirmations.details.backToList')}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {t('confirmations.confirmationNumber')} #{confirmation.confirmation_number}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Send className="h-4 w-4" />
                    <span>{formatDate(confirmation.delivery_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{confirmation.deliver_to_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={confirmation.confirmation_status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isUpdating}>
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canAdvance && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(nextStatus)}>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          {t('orders.status.markAs', { status: t(`orders.status.value.${nextStatus}`) })}
                        </DropdownMenuItem>
                      )}
                      {canCancel && (
                        <DropdownMenuItem
                          onClick={() => setShowCancelConfirm(true)}
                          className="text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {t('orders.status.cancelOrder')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setAddOrdersOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('confirmations.addOrders')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Linked orders */}
          <Card>
            <CardHeader>
              <CardTitle>{t('confirmations.details.ordersTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {confirmation.orders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {t('confirmations.noConfirmations')}
                </p>
              ) : (
                <div className="space-y-3">
                  {confirmation.orders.map((order) => (
                    <div
                      key={order.order_id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">
                            {t('confirmations.details.orderNumber')}{order.document_number}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.delivery_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {order.deliver_to_name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.order_status} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOrderToRemove(order.document_number)}
                          disabled={isUpdating}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add orders dialog */}
      <AddOrdersDialog
        open={addOrdersOpen}
        onOpenChange={setAddOrdersOpen}
        organizationId={organizationId}
        confirmationNumber={confirmationNumber}
      />

      {/* Cancel confirm dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('orders.status.cancelConfirmTitle')}</DialogTitle>
            <DialogDescription>{t('orders.status.cancelConfirmDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
              {t('orders.status.cancelConfirmNo')}
            </Button>
            <Button variant="destructive" onClick={() => handleStatusUpdate('cancelled')}>
              {t('orders.status.cancelConfirmYes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove order confirm dialog */}
      <Dialog open={!!orderToRemove} onOpenChange={() => setOrderToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmations.removeOrder')}</DialogTitle>
            <DialogDescription>{t('confirmations.removeOrder.confirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderToRemove(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => orderToRemove && handleRemoveOrder(orderToRemove)}
            >
              {t('confirmations.removeOrder')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
