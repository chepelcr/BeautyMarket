import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerFiltersProps {
  search: string;
  minSpent: string;
  maxSpent: string;
  minOrders: string;
  maxOrders: string;
  onSearchChange: (value: string) => void;
  onMinSpentChange: (value: string) => void;
  onMaxSpentChange: (value: string) => void;
  onMinOrdersChange: (value: string) => void;
  onMaxOrdersChange: (value: string) => void;
  onClearFilters: () => void;
}

export function CustomerFilters({
  search,
  minSpent,
  maxSpent,
  minOrders,
  maxOrders,
  onSearchChange,
  onMinSpentChange,
  onMaxSpentChange,
  onMinOrdersChange,
  onMaxOrdersChange,
  onClearFilters,
}: CustomerFiltersProps) {
  const { t } = useLanguage();

  const hasActiveFilters = search || minSpent || maxSpent || minOrders || maxOrders;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">{t('customers.filters')}</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            {t('customers.clearFilters')}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="search" className="text-xs">
            {t('customers.search')}
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder={t('customers.searchPlaceholder')}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="minSpent" className="text-xs">
              {t('customers.minSpent')}
            </Label>
            <Input
              id="minSpent"
              type="number"
              placeholder="0"
              value={minSpent}
              onChange={(e) => onMinSpentChange(e.target.value)}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="maxSpent" className="text-xs">
              {t('customers.maxSpent')}
            </Label>
            <Input
              id="maxSpent"
              type="number"
              placeholder={t('customers.noLimit')}
              value={maxSpent}
              onChange={(e) => onMaxSpentChange(e.target.value)}
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="minOrders" className="text-xs">
              {t('customers.minOrders')}
            </Label>
            <Input
              id="minOrders"
              type="number"
              placeholder="0"
              value={minOrders}
              onChange={(e) => onMinOrdersChange(e.target.value)}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="maxOrders" className="text-xs">
              {t('customers.maxOrders')}
            </Label>
            <Input
              id="maxOrders"
              type="number"
              placeholder={t('customers.noLimit')}
              value={maxOrders}
              onChange={(e) => onMaxOrdersChange(e.target.value)}
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
