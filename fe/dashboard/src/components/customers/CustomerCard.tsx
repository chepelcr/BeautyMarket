import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/models';
import { Mail, Phone, MapPin, ShoppingCart, DollarSign, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('customers.noOrders');
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(' ') || t('customers.noName');

  return (
    <Card
      className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
      onClick={() => navigate(`/admin/customers/${customer.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{fullName}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{customer.email}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
        )}

        {customer.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {[customer.address.city, customer.address.state, customer.address.country]
                .filter(Boolean)
                .join(', ') || t('customers.noAddress')}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <ShoppingCart className="h-3 w-3" />
              <span>{t('customers.totalOrders')}</span>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {customer.totalOrders}
            </Badge>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              <span>{t('customers.totalSpent')}</span>
            </div>
            <Badge variant="default" className="font-semibold">
              {formatCurrency(customer.totalSpent)}
            </Badge>
          </div>
        </div>

        {customer.lastOrderDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <Calendar className="h-3 w-3" />
            <span>
              {t('customers.lastOrder')}: {formatDate(customer.lastOrderDate)}
            </span>
          </div>
        )}

        {customer.notes && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p className="line-clamp-2">{customer.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
