import { ShoppingCart, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Customer } from '@/models';

interface CustomerStatsProps {
  customer: Customer;
}

export function CustomerStats({ customer }: CustomerStatsProps) {
  const { t } = useLanguage();

  const formatCurrency = (amount: string | number = 0) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('customers.details.noOrders');
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalOrders = customer.totalOrders ?? 0;
  const totalSpent = customer.totalSpent ?? '0';
  const averageOrderValue = totalOrders > 0 ? parseFloat(totalSpent) / totalOrders : 0;

  const stats = [
    {
      title: t('customers.stats.totalOrders'),
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('customers.stats.totalSpent'),
      value: formatCurrency(totalSpent),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('customers.stats.averageOrder'),
      value: formatCurrency(averageOrderValue),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: t('customers.stats.lastOrder'),
      value: formatDate(customer.lastOrderDate),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
