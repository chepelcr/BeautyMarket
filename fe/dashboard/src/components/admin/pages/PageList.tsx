import {
  Home,
  ShoppingBag,
  Grid,
  Info,
  Mail,
  ShoppingCart,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Page, PageType } from "./types";

interface PageListProps {
  pages: Page[];
  selectedPageId: string | null;
  onPageSelect: (pageId: string) => void;
}

const pageIcons: Record<PageType, React.ComponentType<{ className?: string }>> = {
  home: Home,
  products: ShoppingBag,
  categories: Grid,
  about: Info,
  contact: Mail,
  cart: ShoppingCart,
  checkout: CreditCard,
};

const pageTypeLabels: Record<PageType, string> = {
  home: "Home",
  products: "Products",
  categories: "Categories",
  about: "About",
  contact: "Contact",
  cart: "Cart",
  checkout: "Checkout",
};

export function PageList({ pages, selectedPageId, onPageSelect }: PageListProps) {
  const { t } = useLanguage();
  const sortedPages = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <FileText className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-sm text-gray-500">{t('pages.noPages')}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {sortedPages.map((page) => {
          const Icon = pageIcons[page.type] || FileText;
          const isSelected = page.id === selectedPageId;

          return (
            <button
              key={page.id}
              onClick={() => onPageSelect(page.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                "hover:bg-muted",
                isSelected && "bg-primary/10 text-primary"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isSelected ? "text-pink-600 dark:text-pink-400" : "text-gray-500"
                )}
              />
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{page.title}</div>
                <div className="text-xs text-gray-500">
                  {pageTypeLabels[page.type] || page.type}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {page.isActive ? (
                  <Badge variant="default" className="bg-green-500 text-white text-xs">
                    {t('pages.status.active')}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {t('pages.status.inactive')}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
