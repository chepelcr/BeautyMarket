import { User } from 'lucide-react';
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
      <CardContent>
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {t('orders.customer.name')}
          </div>
          <div className="font-medium">{order.client.name}</div>
        </div>
      </CardContent>
    </Card>
  );
}
