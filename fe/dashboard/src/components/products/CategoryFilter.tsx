import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductListStore } from '@/store/product-list-store';
import type { Category } from '@/models';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const { t } = useLanguage();
  const { filters, setFilters } = useProductListStore();

  const handleChange = (value: string) => {
    if (value === 'all') {
      setFilters({ ...filters, categoryId: undefined });
    } else {
      setFilters({ ...filters, categoryId: value });
    }
  };

  return (
    <Select
      value={filters.categoryId || 'all'}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('products.filters.allCategories')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('products.filters.allCategories')}</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.categoryId} value={category.categoryId}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
