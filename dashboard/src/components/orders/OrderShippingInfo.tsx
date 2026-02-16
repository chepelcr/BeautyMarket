import { MapPin, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Order } from '@/models';

interface OrderShippingInfoProps {
  order: Order;
}

export function OrderShippingInfo({ order }: OrderShippingInfoProps) {
  const { t, language } = useLanguage();

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
            {language === 'es' ? 'Entrega en CEDI' : 'CEDI Deliver'}
          </Badge>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('orders.shipping.address')}
          </div>
          <div className="text-sm">
            <div className="font-medium">{order.delivery_location.code} {order.delivery_location.name}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
