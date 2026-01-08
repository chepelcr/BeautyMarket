import { Edit, Trash2, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow">
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2" title={product.description}>
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="text-xl font-bold">
          ₡{product.price.toLocaleString()}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
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
        </div>
      </CardContent>
    </Card>
  );
}
