import { Link } from 'wouter';
import { DynamicIcon } from './DynamicIcon';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import IngredientBadge from './IngredientBadge';
import { useCartStore } from '@/store/cart';
import { useTheme } from '@/hooks/useContent';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badges?: Array<{ type: 'organic' | 'premium' | 'fresh' | 'local' | 'seasonal'; label: string }>;
  onSale?: boolean;
  salePrice?: number;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  image,
  rating = 0,
  reviewCount = 0,
  badges = [],
  onSale = false,
  salePrice,
}: ProductCardProps) {
  const displayPrice = onSale && salePrice ? salePrice : price;
  const discount = onSale && salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const { addToCart } = useCartStore();
  const { data: theme } = useTheme();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id,
      name,
      price: displayPrice,
      imageUrl: image,
    });
  };

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
      {/* Image */}
      <Link href={`/products/${id}`}>
        <a className="block relative overflow-hidden aspect-square">
          {image ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${image})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-white/80 flex items-center justify-center">
                  <DynamicIcon icon={theme?.productFallbackIcon} fallback="Sparkles" className="w-12 h-12 text-primary/40" size={48} />
                </div>
                <span className="text-xs text-stone-400">Producto sin imagen</span>
              </div>
            </div>
          )}
          {onSale && discount > 0 && (
            <div className="absolute top-3 left-3 bg-gourmet-red text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              -{discount}%
            </div>
          )}
          <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg">
            <Heart className="w-5 h-5 text-stone-600 hover:text-gourmet-red transition-colors" />
          </button>
        </a>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {badges.map((badge, idx) => (
              <IngredientBadge key={idx} type={badge.type} label={badge.label} />
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/products/${id}`}>
          <a>
            <h3 className="text-lg font-serif font-semibold text-stone-900 mb-1 group-hover:text-gourmet-red transition-colors line-clamp-1">
              {name}
            </h3>
          </a>
        </Link>

        {/* Description */}
        <p className="text-sm text-stone-600 mb-3 line-clamp-2">{description}</p>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating ? 'fill-gourmet-gold text-gourmet-gold' : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-stone-500">({reviewCount})</span>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            {onSale && salePrice && (
              <span className="text-lg font-bold text-gourmet-red">${salePrice.toFixed(2)}</span>
            )}
            <span
              className={`${
                onSale && salePrice
                  ? 'text-sm text-stone-400 line-through'
                  : 'text-lg font-bold text-stone-900'
              }`}
            >
              ${price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 bg-gourmet-red hover:bg-gourmet-gold text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md font-medium text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
