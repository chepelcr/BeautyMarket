import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ClientFiltersType {
  status?: string;
}

interface ClientFiltersProps {
  filters: ClientFiltersType;
  onFiltersChange: (filters: ClientFiltersType) => void;
}

const CLIENT_STATUSES = [
  { value: '0', label: 'customers.status.pending' },
  { value: '1', label: 'customers.status.active' },
  { value: '2', label: 'customers.status.inactive' },
];

export function ClientFilters({ filters, onFiltersChange }: ClientFiltersProps) {
  const { t } = useLanguage();

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
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
                {CLIENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {t(status.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
