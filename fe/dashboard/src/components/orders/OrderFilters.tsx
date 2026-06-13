import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OrderFilters as OrderFiltersType } from '@/store/order-list-store';
import { ORDER_STATUSES } from '@/models/Order';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: OrderFiltersType) => void;
}

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const { t } = useLanguage();

  const selectedStatuses = filters.status ?? [];

  const activeFilterCount = [
    selectedStatuses.length > 0 ? 1 : 0,
    filters.startDate ? 1 : 0,
    filters.endDate ? 1 : 0,
    filters.creationStartDate ? 1 : 0,
    filters.creationEndDate ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleStatusToggle = (status: string) => {
    const next = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    onFiltersChange({ ...filters, status: next.length ? next : undefined });
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

          {/* Status filter - multi-select checkboxes */}
          <div className="space-y-2">
            <Label>{t('orders.filters.status')}</Label>
            <div className="space-y-2">
              {ORDER_STATUSES.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => handleStatusToggle(status)}
                  />
                  <label
                    htmlFor={`status-${status}`}
                    className="text-sm cursor-pointer"
                  >
                    {t(`orders.status.${status}`)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery date range */}
          <div className="space-y-2">
            <Label>{t('orders.filters.deliveryDateRange')}</Label>
            <div className="space-y-2">
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined })}
                placeholder={t('orders.filters.startDate')}
              />
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value || undefined })}
                placeholder={t('orders.filters.endDate')}
              />
            </div>
          </div>

          {/* Creation date range */}
          <div className="space-y-2">
            <Label>{t('orders.filters.creationDateRange')}</Label>
            <div className="space-y-2">
              <Input
                type="date"
                value={filters.creationStartDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, creationStartDate: e.target.value || undefined })}
                placeholder={t('orders.filters.startDate')}
              />
              <Input
                type="date"
                value={filters.creationEndDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, creationEndDate: e.target.value || undefined })}
                placeholder={t('orders.filters.endDate')}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
