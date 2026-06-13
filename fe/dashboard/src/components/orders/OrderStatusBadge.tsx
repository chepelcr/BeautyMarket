import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { t } = useLanguage();

  const statusConfig = {
    pending: {
      label: t('orders.status.pending'),
      icon: Clock,
      className: 'bg-muted text-muted-foreground border-border',
    },
    processing: {
      label: t('orders.status.processing'),
      icon: Package,
      className: 'bg-primary/10 text-primary border-primary/20',
    },
    shipped: {
      label: t('orders.status.shipped'),
      icon: Truck,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
    },
    delivered: {
      label: t('orders.status.delivered'),
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    },
    cancelled: {
      label: t('orders.status.cancelled'),
      icon: XCircle,
      className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
