import { Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Order } from '@/models';
import { cn } from '@/lib/utils';

interface OrderStatusTimelineProps {
  order: Order;
}

interface TimelineStep {
  status: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const { t } = useLanguage();

  const steps: TimelineStep[] = [
    {
      status: 'pending',
      label: t('orders.status.pending'),
      icon: <Clock className="h-5 w-5" />,
      description: t('orders.timeline.pendingDescription'),
    },
    {
      status: 'processing',
      label: t('orders.status.processing'),
      icon: <Package className="h-5 w-5" />,
      description: t('orders.timeline.processingDescription'),
    },
    {
      status: 'shipped',
      label: t('orders.status.shipped'),
      icon: <Truck className="h-5 w-5" />,
      description: t('orders.timeline.shippedDescription'),
    },
    {
      status: 'delivered',
      label: t('orders.status.delivered'),
      icon: <CheckCircle className="h-5 w-5" />,
      description: t('orders.timeline.deliveredDescription'),
    },
  ];

  // Handle cancelled status
  if (order.order_status === 'cancelled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            {t('orders.timeline.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <XCircle className="h-6 w-6 text-destructive flex-shrink-0" />
            <div>
              <div className="font-semibold text-destructive">{t('orders.status.cancelled')}</div>
              <div className="text-sm text-muted-foreground">
                {t('orders.timeline.cancelledDescription')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = statusOrder.indexOf(order.order_status);

  const statusColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
    pending: {
      bg: 'bg-gray-200 dark:bg-gray-700',
      border: 'border-gray-300 dark:border-gray-600',
      text: 'text-gray-700 dark:text-gray-200',
      label: 'text-gray-700 dark:text-gray-200',
    },
    processing: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-200',
      label: 'text-blue-800 dark:text-blue-200',
    },
    shipped: {
      bg: 'bg-yellow-400 dark:bg-yellow-500',
      border: 'border-yellow-400 dark:border-yellow-500',
      text: 'text-yellow-900 dark:text-yellow-100',
      label: 'text-yellow-700 dark:text-yellow-400',
    },
    delivered: {
      bg: 'bg-green-500 dark:bg-green-600',
      border: 'border-green-500 dark:border-green-600',
      text: 'text-white',
      label: 'text-green-600 dark:text-green-400',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('orders.timeline.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPast = index < currentStepIndex;
            const currentColors = statusColors[step.status];

            return (
              <div key={step.status} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-[18px] top-[36px] w-0.5 h-[calc(100%-0.5rem)]',
                      isPast ? 'bg-blue-500' : isCurrent ? currentColors.bg : 'bg-muted'
                    )}
                  />
                )}

                {/* Step content */}
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-full border-2 flex-shrink-0',
                      isPast
                        ? 'bg-blue-500 border-blue-500 text-white dark:bg-blue-600 dark:border-blue-600'
                        : isCurrent
                          ? `${currentColors.bg} ${currentColors.border} ${currentColors.text}`
                          : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                    )}
                  >
                    {step.icon}
                  </div>

                  {/* Text content */}
                  <div className="flex-1 pt-1">
                    <div
                      className={cn(
                        'font-semibold',
                        isCurrent && currentColors.label,
                        isPast && 'text-blue-600 dark:text-blue-400',
                        !isCompleted && 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </div>
                    {isCurrent && step.status !== 'delivered' && (
                      <div className={cn('mt-2 text-xs font-medium', currentColors.label)}>
                        {t('orders.timeline.current')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
