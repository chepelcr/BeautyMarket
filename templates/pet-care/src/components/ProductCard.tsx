import React, { useState } from 'react';
import { DynamicIcon } from './DynamicIcon';
import { Link } from 'wouter';
import { ShoppingCart, Heart, Star, Check } from 'lucide-react';
import { PawIcon } from './PawPrintDecoration';
import { useCartStore } from '@/store/cart';
import { useTheme } from '@/hooks/useContent';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const { addToCart } = useCartStore();
  const { data: theme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image,
    });
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1500);
    onAddToCart?.(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleFavorite?.(product.id);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <a className="group block">
        <div className="bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary/20 hover:-translate-y-2">
          {/* Image Container */}
          <div className="relative overflow-hidden bg-muted/30 aspect-square">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-card flex items-center justify-center">
                    <DynamicIcon icon={theme?.productFallbackIcon} fallback="Sparkles" className="w-12 h-12 text-primary/40" size={48} />
                  </div>
                  <span className="text-xs text-muted-foreground">Producto sin imagen</span>
                </div>
              </div>
            )}

            {/* Badge */}
            {product.badge && (
              <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-md">
                {product.badge}
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-3 right-3 p-2 bg-card/95 rounded-full shadow-md hover:scale-110 transition-transform"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite
                    ? 'text-primary fill-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              />
            </button>

            {/* Stock Status */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-xl font-bold">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Paw print decoration on hover */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-30 transition-opacity">
              <PawIcon className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Category */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg">
                {product.category}
              </span>
              {product.inStock && (
                <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-lg">
                  In Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-secondary fill-secondary'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviews})
              </span>
            </div>

            {/* Price and Add to Cart */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                  product.inStock
                    ? isAdding
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-lg'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {isAdding ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                <span className="hidden sm:inline">{isAdding ? 'Added!' : 'Add'}</span>
              </button>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ProductCard;
