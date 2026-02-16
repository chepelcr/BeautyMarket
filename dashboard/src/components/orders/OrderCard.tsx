import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Send, Phone, MapPin, Package } from 'lucide-react';
import type { Order } from '@/models';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const { t, language } = useLanguage();

  const itemCount = order.lines?.length || 0;

  const formatDate = (dateStr: string) => {
    // Parse DD/MM/YYYY format
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString(language === 'es' ? 'es-CR' : 'en-US', {
      year: 'numeric',
      month: 'short',
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
                {t('orders.orderNumber')} #{order.document_number}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {order.client.name}
            </p>
          </div>
          <OrderStatusBadge status={order.order_status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Order details */}
        <div className="space-y-2 text-sm">
          {/* Delivery date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Send className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(order.delivery_date)}</span>
          </div>

          {/* Supplier */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{order.supplier.name}</span>
          </div>

          {/* Delivery location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1" title={order.delivery_location.name}>
              {order.delivery_location.name}
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

        {/* Event type */}
        <div>
          <Badge variant="outline" className="text-xs">
            {order.event}
          </Badge>
        </div>

        {/* Total */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t('orders.total')}
            </span>
            <span className="text-xl font-bold">
              ₡{order.grand_total.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
