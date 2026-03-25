import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useProductListStore } from '@/store/product-list-store';
import { useLanguage } from '@/contexts/LanguageContext';

export function AdvancedFilters() {
  const { t } = useLanguage();
  const { filters, setFilters } = useProductListStore();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for form inputs
  const [priceMin, setPriceMin] = useState<string>(filters.priceMin?.toString() || '');
  const [priceMax, setPriceMax] = useState<string>(filters.priceMax?.toString() || '');
  const [salePriceMin, setSalePriceMin] = useState<string>(filters.salePriceMin?.toString() || '');
  const [salePriceMax, setSalePriceMax] = useState<string>(filters.salePriceMax?.toString() || '');

  const hasActiveFilters =
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.salePriceMin !== undefined ||
    filters.salePriceMax !== undefined;

  const handleApply = () => {
    const newFilters = { ...filters };

    // Price filters
    if (priceMin) {
      newFilters.priceMin = parseFloat(priceMin);
    } else {
      delete newFilters.priceMin;
    }

    if (priceMax) {
      newFilters.priceMax = parseFloat(priceMax);
    } else {
      delete newFilters.priceMax;
    }

    // Sale price filters
    if (salePriceMin) {
      newFilters.salePriceMin = parseFloat(salePriceMin);
    } else {
      delete newFilters.salePriceMin;
    }

    if (salePriceMax) {
      newFilters.salePriceMax = parseFloat(salePriceMax);
    } else {
      delete newFilters.salePriceMax;
    }

    setFilters(newFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setPriceMin('');
    setPriceMax('');
    setSalePriceMin('');
    setSalePriceMax('');

    const newFilters = { ...filters };
    delete newFilters.priceMin;
    delete newFilters.priceMax;
    delete newFilters.salePriceMin;
    delete newFilters.salePriceMax;
    setFilters(newFilters);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          className="h-9"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {t('products.filters.advanced')}
          {hasActiveFilters && (
            <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {[
                filters.priceMin,
                filters.priceMax,
                filters.salePriceMin,
                filters.salePriceMax,
              ].filter((v) => v !== undefined).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{t('products.filters.advancedTitle')}</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                {t('products.filters.clearAll')}
              </Button>
            )}
          </div>

          <Separator />

          {/* Price Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('products.filters.price')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="priceMin" className="text-xs text-muted-foreground">
                  {t('products.filters.min')}
                </Label>
                <Input
                  id="priceMin"
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="h-8"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="priceMax" className="text-xs text-muted-foreground">
                  {t('products.filters.max')}
                </Label>
                <Input
                  id="priceMax"
                  type="number"
                  placeholder="999999"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="h-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Sale Price Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('products.filters.salePrice')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="salePriceMin" className="text-xs text-muted-foreground">
                  {t('products.filters.min')}
                </Label>
                <Input
                  id="salePriceMin"
                  type="number"
                  placeholder="0"
                  value={salePriceMin}
                  onChange={(e) => setSalePriceMin(e.target.value)}
                  className="h-8"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="salePriceMax" className="text-xs text-muted-foreground">
                  {t('products.filters.max')}
                </Label>
                <Input
                  id="salePriceMax"
                  type="number"
                  placeholder="999999"
                  value={salePriceMax}
                  onChange={(e) => setSalePriceMax(e.target.value)}
                  className="h-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleApply} className="flex-1" size="sm">
              {t('products.filters.apply')}
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              size="sm"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
