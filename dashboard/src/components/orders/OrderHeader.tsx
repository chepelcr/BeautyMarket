import { Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Order } from '@/models';

interface OrderHeaderProps {
  order: Order;
  onStatusUpdate: (status: string) => void;
  isUpdating: boolean;
}

export function OrderHeader({ order, onStatusUpdate, isUpdating }: OrderHeaderProps) {
  const { t } = useLanguage();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {t('orders.orderNumber')} #{order.id.slice(0, 8)}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t('orders.details.updateStatus')}:
              </span>
              <Select
                value={order.status}
                onValueChange={onStatusUpdate}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[180px]">
                  {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t('orders.status.pending')}</SelectItem>
                  <SelectItem value="processing">{t('orders.status.processing')}</SelectItem>
                  <SelectItem value="shipped">{t('orders.status.shipped')}</SelectItem>
                  <SelectItem value="delivered">{t('orders.status.delivered')}</SelectItem>
                  <SelectItem value="cancelled">{t('orders.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-lg font-medium text-muted-foreground">
            {t('orders.total')}
          </span>
          <span className="text-3xl font-bold">
            ₡{order.total.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
