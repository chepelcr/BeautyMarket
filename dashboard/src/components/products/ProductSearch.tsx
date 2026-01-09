import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProductListStore } from '@/store/product-list-store';
import { useLanguage } from '@/contexts/LanguageContext';

export function ProductSearch() {
  const { searchQuery, setSearchQuery } = useProductListStore();
  const { t } = useLanguage();

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={t("products.searchPlaceholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-9"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t("products.clearSearch")}</span>
        </Button>
      )}
    </div>
  );
}
