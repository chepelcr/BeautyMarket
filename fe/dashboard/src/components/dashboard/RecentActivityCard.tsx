import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  timestamp?: Date | string;
  icon?: LucideIcon;
}

interface RecentActivityCardProps {
  title: string;
  items: ActivityItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  onItemClick?: (item: ActivityItem) => void;
}

export function RecentActivityCard({
  title,
  items,
  isLoading = false,
  emptyMessage,
  onItemClick,
}: RecentActivityCardProps) {
  const { t } = useLanguage();

  const formatTimestamp = (ts: Date | string | undefined) => {
    if (!ts) return null;
    const date = typeof ts === 'string' ? new Date(ts) : ts;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('dashboard.time.justNow');
    if (minutes < 60) return t('dashboard.time.minutesAgo').replace('{minutes}', minutes.toString());
    if (hours < 24) return t('dashboard.time.hoursAgo').replace('{hours}', hours.toString());
    if (days < 7) return t('dashboard.time.daysAgo').replace('{days}', days.toString());
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {emptyMessage || t('dashboard.noRecentActivity')}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 ${
                    onItemClick ? 'cursor-pointer hover:bg-accent/50 -mx-2 px-2 py-1 rounded-md transition-colors' : ''
                  }`}
                  onClick={() => onItemClick?.(item)}
                >
                  {ItemIcon && (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ItemIcon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.badge && (
                        <Badge variant={item.badge.variant || 'secondary'} className="flex-shrink-0">
                          {item.badge.label}
                        </Badge>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                    {item.timestamp && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
