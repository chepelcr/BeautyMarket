import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OrderFilters as OrderFiltersType } from '@/hooks/useOrders';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: OrderFiltersType) => void;
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const { t } = useLanguage();

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
    });
  };

  const handleStartDateChange = (value: string) => {
    onFiltersChange({
      ...filters,
      startDate: value || undefined,
    });
  };

  const handleEndDateChange = (value: string) => {
    onFiltersChange({
      ...filters,
      endDate: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{t('orders.filter')}</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{t('orders.filters.title')}</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                {t('orders.filters.clearAll')}
              </Button>
            )}
          </div>

          {/* Status filter */}
          <div className="space-y-2">
            <Label>{t('orders.filters.status')}</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('orders.filters.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('orders.filters.allStatuses')}</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`orders.status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range filters */}
          <div className="space-y-2">
            <Label>{t('orders.filters.dateRange')}</Label>
            <div className="space-y-2">
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleStartDateChange(e.target.value)}
                placeholder={t('orders.filters.startDate')}
              />
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                placeholder={t('orders.filters.endDate')}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
