import { CreditCard, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Order } from '@/models';

interface OrderPaymentInfoProps {
  order: Order;
}

export function OrderPaymentInfo({ order }: OrderPaymentInfoProps) {
  const { t } = useLanguage();

  // For MVP, we'll show basic payment info
  // In the future, this could include payment method, transaction ID, etc.
  const isPaid = order.status !== 'pending' && order.status !== 'cancelled';

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
            {t('orders.payment.status')}
          </div>
          <Badge variant={isPaid ? 'default' : 'secondary'} className="mt-1">
            {isPaid ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('orders.payment.paid')}
              </>
            ) : (
              t('orders.payment.pending')
            )}
          </Badge>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {t('orders.payment.amount')}
          </div>
          <div className="text-2xl font-bold">₡{order.total.toLocaleString()}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {t('orders.payment.method')}
          </div>
          <div className="text-sm">{t('orders.payment.cashOnDelivery')}</div>
        </div>
      </CardContent>
    </Card>
  );
}
