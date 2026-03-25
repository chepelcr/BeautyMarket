import { Edit, Trash2, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product, Category } from '@/models';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
  product: Product;
  categories: Category[];
  isSelected: boolean;
  onToggleSelection: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({
  product,
  categories,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const { t } = useLanguage();
  // Use embedded category from product if available, otherwise lookup from categories array
  const category = product.category || categories.find((c) => c.categoryId === product.categoryId);

  // Inventory status helpers
  const isOutOfStock = product.trackInventory && (product.stockQuantity ?? 0) === 0;
  const isLowStock = product.trackInventory &&
                     !isOutOfStock &&
                     (product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 10);

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelection}
          className="bg-background border-2"
          aria-label={`Select ${product.name}`}
        />
      </div>

      <CardHeader className="pb-3 pt-10">
        {/* Product image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" aria-label="No image available" />
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1" title={product.name}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
            <Badge variant={product.isActive ? 'default' : 'outline'} className="text-xs">
              {product.isActive ? t('products.filters.active') : t('products.filters.inactive')}
            </Badge>
            {/* Stock status badges */}
            {isOutOfStock && (
              <Badge variant="destructive" className="text-xs">
                {t('products.inventory.outOfStock')}
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700">
                {t('products.inventory.lowStock')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Description - fixed height */}
        <div className="h-10 mb-3">
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2" title={product.description}>
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="text-xl font-bold mb-3">
          ₡{product.price.toLocaleString()}
        </div>

        {/* Stock information */}
        {product.trackInventory && (
          <div className="text-sm text-muted-foreground">
            {product.sku && (
              <div className="mb-1">
                <span className="font-medium">SKU:</span> {product.sku}
              </div>
            )}
            <div>
              <span className="font-medium">{t('products.inventory.stock')}:</span>{' '}
              <span className={isOutOfStock ? 'text-destructive font-semibold' : isLowStock ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : ''}>
                {product.stockQuantity ?? 0} {t('products.inventory.units')}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-1" />
          {t('common.edit')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {t('common.delete')}
        </Button>
      </CardFooter>
    </Card>
  );
}
