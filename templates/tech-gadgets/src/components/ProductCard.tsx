import { Link } from 'wouter';
import { DynamicIcon } from './DynamicIcon';
import { ShoppingCart, Star, Zap, Check } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { useTheme } from '@/hooks/useContent';

export interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  badge?: string;
  rating?: number;
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  image,
  badge,
  rating,
  onAddToCart,
}: ProductCardProps) {
  const { addToCart } = useCartStore();
  const { data: theme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({ id, name, price, imageUrl: image });
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1500);

    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  return (
    <Link href={`/products/${id}`}>
      <div className="card-tech group cursor-pointer h-full flex flex-col relative overflow-hidden">
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-tech-cyan/0 group-hover:bg-tech-cyan/5 transition-colors duration-300 pointer-events-none" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tech-cyan to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tech-cyan to-transparent" />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-tech-cyan to-transparent" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-tech-cyan to-transparent" />
        </div>

        {/* Product Image */}
        <div className="aspect-square bg-background rounded-sm mb-4 overflow-hidden relative">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center tech-gradient-subtle group-hover:tech-gradient transition-all duration-300">
              <DynamicIcon icon={theme?.productFallbackIcon} fallback="Sparkles" className="w-12 h-12 text-primary/40" size={48} />
            </div>
          )}

          {/* Badge */}
          {badge && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-accent text-accent-foreground rounded-sm text-xs font-medium shadow-lg backdrop-blur-sm">
                {badge}
              </span>
            </div>
          )}

          {/* Quick Add to Cart Button (appears on hover) */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full btn-tech-accent flex items-center justify-center space-x-2 py-2 tech-glow-hover"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Quick Add</span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col relative z-10">
          <h4 className="font-semibold mb-2 group-hover:text-tech-cyan transition-colors line-clamp-2">
            {name}
          </h4>
          <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">
            {description}
          </p>

          {/* Rating */}
          {rating && (
            <div className="flex items-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating)
                      ? 'text-tech-cyan fill-tech-cyan'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-tech-cyan group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all">
                ${price.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className={`p-2 rounded-sm transition-all group/btn relative ${
                isAdding ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary/90'
              }`}
              aria-label="Add to cart"
            >
              {isAdding ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              <div className="absolute inset-0 bg-tech-cyan/20 blur-lg opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-full" />
            </button>
          </div>
        </div>

        {/* Tech Corner Accent */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
          <div className="absolute top-0 right-0 border-t-2 border-r-2 border-tech-cyan w-full h-full" />
        </div>
      </div>
    </Link>
  );
}
