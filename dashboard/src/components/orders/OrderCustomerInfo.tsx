import { User, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Order } from '@/models';

interface OrderCustomerInfoProps {
  order: Order;
}

export function OrderCustomerInfo({ order }: OrderCustomerInfoProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t('orders.customer.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {t('orders.customer.name')}
          </div>
          <div className="font-medium">{order.customerName}</div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a
            href={`tel:${order.customerPhone}`}
            className="hover:underline"
          >
            {order.customerPhone}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
