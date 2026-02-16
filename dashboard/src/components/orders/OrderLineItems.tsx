import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Order } from '@/models';

interface OrderLineItemsProps {
  order: Order;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export function OrderLineItems({ order }: OrderLineItemsProps) {
  const { t } = useLanguage();

  const items = order.lines || [];
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t('orders.lineItems.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.lineItems.product')}</TableHead>
                <TableHead className="text-right">{t('orders.lineItems.price')}</TableHead>
                <TableHead className="text-center w-[100px]">{t('orders.lineItems.quantity')}</TableHead>
                <TableHead className="text-right">{t('orders.lineItems.total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.line_number}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Code: {item.code} | Internal: {item.internal_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">₡{item.unit_price.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{item.quantity_ordered}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₡{item.line_total.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('orders.lineItems.subtotal')}</span>
            <span className="font-medium">₡{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discounts > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('orders.lineItems.discounts')}</span>
              <span className="font-medium text-green-600">-₡{order.discounts.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('orders.lineItems.netTotal')}</span>
            <span className="font-medium">₡{order.net_total.toLocaleString()}</span>
          </div>
          {order.taxes > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('orders.lineItems.taxes')}</span>
              <span className="font-medium">₡{order.taxes.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-semibold">{t('orders.lineItems.orderTotal')}</span>
            <span className="text-xl font-bold">₡{order.grand_total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
