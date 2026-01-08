import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryFilter } from './CategoryFilter';
import { StatusFilter } from './StatusFilter';
import { useProductListStore } from '@/store/product-list-store';
import type { Category } from '@/models';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const { t } = useLanguage();
  const { filters, clearFilters } = useProductListStore();

  const hasActiveFilters =
    filters.categoryId ||
    filters.isActive !== undefined ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">{t('products.filters.label')}</span>
      </div>
      <CategoryFilter categories={categories} />
      <StatusFilter />
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9"
        >
          <X className="h-4 w-4 mr-1" />
          {t('products.filters.clear')}
        </Button>
      )}
    </div>
  );
}
