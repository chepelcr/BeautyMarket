import { MapPin, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Order } from '@/models';

interface OrderShippingInfoProps {
  order: Order;
}

export function OrderShippingInfo({ order }: OrderShippingInfoProps) {
  const { t } = useLanguage();

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case 'correos':
        return t('orders.delivery.correos');
      case 'uber-flash':
        return t('orders.delivery.uberFlash');
      case 'personal':
        return t('orders.delivery.personal');
      default:
        return method;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          {t('orders.shipping.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">
            {t('orders.shipping.method')}
          </div>
          <Badge variant="outline">
            {getDeliveryMethodLabel(order.deliveryMethod)}
          </Badge>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('orders.shipping.address')}
          </div>
          <div className="text-sm space-y-1">
            <div className="font-medium">{order.customerName}</div>
            <div>{order.address}</div>
            <div>
              {order.distrito}, {order.canton}
            </div>
            <div>{order.provincia}</div>
            <div className="pt-2 text-muted-foreground">{order.customerPhone}</div>
          </div>
        </div>

        {order.status === 'shipped' && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              {t('orders.shipping.tracking')}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('orders.shipping.trackingNotAvailable')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
