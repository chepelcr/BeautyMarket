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
      variant: 'secondary' as const,
      label: t('orders.status.pending'),
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    processing: {
      variant: 'default' as const,
      label: t('orders.status.processing'),
      icon: Package,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    shipped: {
      variant: 'default' as const,
      label: t('orders.status.shipped'),
      icon: Truck,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    },
    delivered: {
      variant: 'default' as const,
      label: t('orders.status.delivered'),
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    cancelled: {
      variant: 'outline' as const,
      label: t('orders.status.cancelled'),
      icon: XCircle,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
