import { useLocation } from 'wouter';
import { ExternalLink, Send, MapPin, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import type { Order } from '@/models';

interface CustomerOrderHistoryProps {
  orders: Order[];
  isLoading?: boolean;
}

export function CustomerOrderHistory({ orders, isLoading }: CustomerOrderHistoryProps) {
  const { t, language } = useLanguage();
  const [, navigate] = useLocation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // Parse DD/MM/YYYY format
    const [day, month, year] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString(language === 'es' ? 'es-CR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('customers.orders.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('common.loading')}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('customers.orders.noOrders')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => {
              const itemCount = order.lines?.length || 0;
              return (
                <div
                  key={order.order_id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/orders/${order.document_number}`)}
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold">
                        #{order.document_number}
                      </span>
                      <OrderStatusBadge status={order.order_status} />
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Send className="h-3 w-3" />
                        <span>{formatDate(order.delivery_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{order.delivery_location.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        <span>{itemCount} {itemCount === 1 ? t('orders.item') : t('orders.items')}</span>
                      </div>
                    </div>
                    <div className="font-semibold text-foreground">
                      {formatCurrency(order.grand_total)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/orders/${order.document_number}`);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
