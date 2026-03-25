import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { ReportColorSelector, getDefaultColorForDepartment } from './ReportColorSelector';
import type { Order, ReportColorScheme } from '@/models';

interface ReprocessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  organizationId: string;
  documentNumber: string;
  onSuccess?: (updatedOrder: Order) => void;
}

export function ReprocessDialog({ open, onOpenChange, order, organizationId, documentNumber, onSuccess }: ReprocessDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [color, setColor] = useState<ReportColorScheme>(
    order.report_color || getDefaultColorForDepartment(order.department)
  );

  const handleReprocess = async () => {
    setIsReprocessing(true);
    try {
      const response = await apiRequest(
        'POST',
        `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/${documentNumber}/reprocess`,
        { color }
      );
      const updatedOrder = await response.json();
      toast({ title: t('orders.actions.reprocessSuccess') });
      onOpenChange(false);
      onSuccess?.(updatedOrder);
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

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) {
          setColor(order.report_color || getDefaultColorForDepartment(order.department));
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('orders.actions.reprocess')} #{documentNumber}</DialogTitle>
          <DialogDescription>
            {t('orders.colorScheme.reprocessDescription') || 'Select the report color scheme before reprocessing.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label className="text-sm font-medium mb-3 block">
            {t('orders.colorScheme.label') || 'Color del reporte'}
          </Label>
          <ReportColorSelector value={color} onChange={setColor} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel') || 'Cancelar'}
          </Button>
          <Button onClick={handleReprocess} disabled={isReprocessing}>
            {isReprocessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('orders.actions.reprocess')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
