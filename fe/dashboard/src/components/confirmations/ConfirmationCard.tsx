import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Send, MapPin, Package } from 'lucide-react';
import type { Confirmation } from '@/models';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConfirmationCardProps {
  confirmation: Confirmation;
  onClick?: () => void;
}

export function ConfirmationCard({ confirmation, onClick }: ConfirmationCardProps) {
  const { t, language } = useLanguage();

  const orderCount = confirmation.orders?.length || 0;

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString(language === 'es' ? 'es-CR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      className="group relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-semibold text-lg truncate">
              {t('confirmations.confirmationNumber')} #{confirmation.confirmation_number}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <OrderStatusBadge status={confirmation.confirmation_status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {/* Delivery date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Send className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(confirmation.delivery_date)}</span>
          </div>

          {/* Delivery place */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1" title={confirmation.deliver_to_name}>
              {confirmation.deliver_to_name}
            </span>
          </div>

          {/* Orders count */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4 flex-shrink-0" />
            <span>
              {orderCount === 1
                ? t('confirmations.ordersSingular')
                : t('confirmations.ordersCount', { count: String(orderCount) })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
