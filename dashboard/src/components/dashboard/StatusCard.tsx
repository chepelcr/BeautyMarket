import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type StatusType = 'success' | 'error' | 'warning' | 'pending' | 'info';

interface StatusCardProps {
  title: string;
  status: StatusType;
  icon: LucideIcon;
  message?: string;
  timestamp?: Date | string;
  isLoading?: boolean;
}

export function StatusCard({
  title,
  status,
  icon: Icon,
  message,
  timestamp,
  isLoading = false,
}: StatusCardProps) {
  const { t } = useLanguage();

  const statusConfig = {
    success: {
      icon: CheckCircle2,
      label: t('dashboard.status.active'),
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    error: {
      icon: XCircle,
      label: t('dashboard.status.error'),
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
    warning: {
      icon: AlertCircle,
      label: t('dashboard.status.warning'),
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    },
    pending: {
      icon: Clock,
      label: t('dashboard.status.pending'),
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
    info: {
      icon: AlertCircle,
      label: t('dashboard.status.info'),
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatTimestamp = (ts: Date | string | undefined) => {
    if (!ts) return null;
    const date = typeof ts === 'string' ? new Date(ts) : ts;
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge variant="secondary" className={config.className}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
        {message && (
          <p className="text-sm text-muted-foreground line-clamp-2">{message}</p>
        )}
        {timestamp && (
          <p className="text-xs text-muted-foreground">{formatTimestamp(timestamp)}</p>
        )}
      </CardContent>
    </Card>
  );
}
