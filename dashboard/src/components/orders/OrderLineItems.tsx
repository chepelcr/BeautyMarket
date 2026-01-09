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

  // Parse items from JSON string
  let items: OrderItem[] = [];
  try {
    items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
  } catch (error) {
    console.error('Failed to parse order items:', error);
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
                <TableHead className="w-[80px]">{t('orders.lineItems.image')}</TableHead>
                <TableHead>{t('orders.lineItems.product')}</TableHead>
                <TableHead className="text-right">{t('orders.lineItems.price')}</TableHead>
                <TableHead className="text-center w-[100px]">{t('orders.lineItems.quantity')}</TableHead>
                <TableHead className="text-right">{t('orders.lineItems.total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">₡{item.price.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₡{(item.price * item.quantity).toLocaleString()}
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
            <span className="font-medium">₡{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-semibold">{t('orders.lineItems.orderTotal')}</span>
            <span className="text-xl font-bold">₡{order.total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
