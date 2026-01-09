import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Calendar, Phone, MapPin, Package } from 'lucide-react';
import type { Order } from '@/models';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const { t } = useLanguage();

  // Parse items if stored as string
  let itemsData: any[] = [];
  try {
    itemsData = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
  } catch (error) {
    console.error('Failed to parse order items:', error);
  }

  const itemCount = Array.isArray(itemsData) ? itemsData.length : 0;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card
      className="group relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">
                {t('orders.orderNumber')} #{order.id.slice(0, 8)}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {order.customerName}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Order details */}
        <div className="space-y-2 text-sm">
          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(order.createdAt)}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{order.customerPhone}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1" title={`${order.provincia}, ${order.canton}, ${order.distrito}`}>
              {order.provincia}, {order.canton}
            </span>
          </div>

          {/* Items count */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4 flex-shrink-0" />
            <span>
              {itemCount} {itemCount === 1 ? t('orders.item') : t('orders.items')}
            </span>
          </div>
        </div>

        {/* Delivery method */}
        <div>
          <Badge variant="outline" className="text-xs">
            {order.deliveryMethod === 'correos' && t('orders.delivery.correos')}
            {order.deliveryMethod === 'uber-flash' && t('orders.delivery.uberFlash')}
            {order.deliveryMethod === 'personal' && t('orders.delivery.personal')}
            {order.deliveryMethod !== 'correos' &&
             order.deliveryMethod !== 'uber-flash' &&
             order.deliveryMethod !== 'personal' &&
             order.deliveryMethod}
          </Badge>
        </div>

        {/* Total */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t('orders.total')}
            </span>
            <span className="text-xl font-bold">
              ₡{order.total.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
