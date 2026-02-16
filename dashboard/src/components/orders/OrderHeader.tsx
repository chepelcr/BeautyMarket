import { Calendar, MoreVertical, Eye, FileText, Upload, Loader2, RefreshCw, Send, ArrowRight, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CrossdockingPDFPreview } from './CrossdockingPDFPreview';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/models';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderHeaderProps {
  order: Order;
  organizationId: string;
  documentNumber: string;
  onReprocessSuccess?: (updatedOrder: Order) => void;
  onCrossdockingUploadSuccess?: () => void;
}

export function OrderHeader({ order, organizationId, documentNumber, onReprocessSuccess, onCrossdockingUploadSuccess }: OrderHeaderProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [crossdockingPreviewOpen, setCrossdockingPreviewOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString(language === 'es' ? 'es-CR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'ORDERS':
        return t('orders.documentType.orders');
      default:
        return type;
    }
  };

  const handleCrossdockingFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!(file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls'))) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an Excel file (.xlsx or .xls)',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    toast({ title: t('orders.crossdocking.uploading') });

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
      });

      const response = await fetch(
        `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/${documentNumber}/crossdocking/parse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: base64Data,
            name: file.name,
            contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        }
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

      toast({ title: t('orders.crossdocking.uploadSuccess') });
      onCrossdockingUploadSuccess?.();
    } catch (error) {
      console.error('Crossdocking upload error:', error);
      toast({
        title: t('orders.crossdocking.uploadError'),
        description: error instanceof Error ? error.message : 'Failed to upload crossdocking file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReprocess = async () => {
    setIsReprocessing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/${documentNumber}/reprocess`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error(`Reprocess failed: ${response.statusText}`);

      const updatedOrder = await response.json();
      toast({ title: t('orders.actions.reprocessSuccess') });
      onReprocessSuccess?.(updatedOrder);
    } catch (error) {
      console.error('Reprocess error:', error);
      toast({
        title: t('orders.actions.reprocessError'),
        description: error instanceof Error ? error.message : 'Failed to reprocess order',
        variant: 'destructive',
      });
    } finally {
      setIsReprocessing(false);
    }
  };

  const statusMap: Record<string, number> = {
    'pending': 1,
    'processing': 2,
    'shipped': 3,
    'delivered': 4,
    'cancelled': 5
  };

  const nextStatusMap: Record<string, string> = {
    'pending': 'processing',
    'processing': 'shipped',
    'shipped': 'delivered'
  };

  const currentStatus = order.order_status;
  const nextStatus = nextStatusMap[currentStatus];
  const canAdvance = !!nextStatus;
  const canCancel = currentStatus !== 'delivered' && currentStatus !== 'cancelled';

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/${documentNumber}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: statusMap[newStatus] })
        }
      );

      if (!response.ok) throw new Error(`Status update failed: ${response.statusText}`);

      const updatedOrder = await response.json();
      toast({ title: t('orders.status.updateSuccess') });
      onReprocessSuccess?.(updatedOrder);
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: t('orders.status.updateError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
      setShowCancelConfirm(false);
    }
  };

  const isCrossdockingType = order.order_type === '73';
  const hasCrossdocking = isCrossdockingType && !!order.crossdocking;
  const orderPdfUrl = order.attachments?.pdf_url || '';
  const orderExcelUrl = order.attachments?.excel_url || '';
  const nuevoReporteUrl = order.attachments?.nuevo_reporte_url || '';
  const crossdockingPdfUrl = order.crossdocking?.attachments?.pdf_url || '';
  const crossdockingExcelUrl = order.crossdocking?.attachments?.excel_url || '';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {t('orders.orderNumber')} #{order.document_number}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(order.creation_date)}</span>
              </div>
              {order.delivery_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Send className="h-4 w-4" />
                  <span>{formatDate(order.delivery_date)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.order_status} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isUploading || isReprocessing || isUpdatingStatus}>
                    {(isUploading || isReprocessing || isUpdatingStatus) ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
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
                    <DropdownMenuItem onClick={() => setShowCancelConfirm(true)} className="text-destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('orders.status.cancelOrder')}
                    </DropdownMenuItem>
                  )}
                  {hasCrossdocking && (
                    <DropdownMenuItem onClick={() => setCrossdockingPreviewOpen(true)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {t('orders.crossdocking.viewCrossdocking')}
                    </DropdownMenuItem>
                  )}
                  {isCrossdockingType && (
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {t('orders.crossdocking.upload')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleReprocess} disabled={isReprocessing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isReprocessing ? 'animate-spin' : ''}`} />
                    {t('orders.actions.reprocess')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    {t('orders.actions.addNotes')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-lg font-medium text-muted-foreground">
              {t('orders.total')}
            </span>
            <span className="text-3xl font-bold">
              ₡{order.grand_total.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {isCrossdockingType && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleCrossdockingFileSelect}
          className="hidden"
        />
      )}

      {hasCrossdocking && (
        <CrossdockingPDFPreview
          isOpen={crossdockingPreviewOpen}
          onClose={() => setCrossdockingPreviewOpen(false)}
          pdfUrl={crossdockingPdfUrl}
          orderPdfUrl={orderPdfUrl}
          orderExcelUrl={orderExcelUrl}
          nuevoReporteUrl={nuevoReporteUrl}
          crossdockingExcelUrl={crossdockingExcelUrl}
          title={`${t('orders.crossdocking.preview')} - #${order.document_number}`}
        />
      )}

      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('orders.status.cancelConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('orders.status.cancelConfirmDescription')}
            </DialogDescription>
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
    </>
  );
}
