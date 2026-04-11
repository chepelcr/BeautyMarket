import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Order } from '@/models';

interface OrderPaymentInfoProps {
  order: Order;
}

export function OrderPaymentInfo({ order }: OrderPaymentInfoProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('orders.payment.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {t('orders.lineItems.subtotal')}
          </div>
          <div className="text-lg font-semibold">₡{order.subtotal.toLocaleString()}</div>
        </div>

        {order.discounts > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              {t('orders.lineItems.discounts')}
            </div>
            <div className="text-lg font-semibold text-green-600">-₡{order.discounts.toLocaleString()}</div>
          </div>
        )}

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {t('orders.lineItems.netTotal')}
          </div>
          <div className="text-lg font-semibold">₡{order.net_total.toLocaleString()}</div>
        </div>

        {order.taxes > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              {t('orders.lineItems.taxes')}
            </div>
            <div className="text-lg font-semibold">₡{order.taxes.toLocaleString()}</div>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {t('orders.payment.amount')}
          </div>
          <div className="text-2xl font-bold">₡{order.grand_total.toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
