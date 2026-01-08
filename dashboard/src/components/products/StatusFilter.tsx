import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductListStore } from '@/store/product-list-store';
import { useLanguage } from '@/contexts/LanguageContext';

export function StatusFilter() {
  const { t } = useLanguage();
  const { filters, setFilters } = useProductListStore();

  const handleChange = (value: string) => {
    if (value === 'all') {
      setFilters({ ...filters, isActive: undefined });
    } else {
      setFilters({ ...filters, isActive: value === 'active' });
    }
  };

  const currentValue = filters.isActive === undefined
    ? 'all'
    : filters.isActive
    ? 'active'
    : 'inactive';

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={t('products.filters.allStatus')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('products.filters.allStatus')}</SelectItem>
        <SelectItem value="active">{t('products.filters.active')}</SelectItem>
        <SelectItem value="inactive">{t('products.filters.inactive')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
