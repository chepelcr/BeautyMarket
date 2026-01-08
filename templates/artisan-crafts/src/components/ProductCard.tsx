import { Link } from 'wouter';
import { ShoppingCart, Heart, Star, Check } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';

interface ProductCardProps {
  id: string | number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  badge?: 'new' | 'sale' | 'featured' | null;
  rating?: number;
  artisan?: string;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  category,
  image,
  badge,
  rating = 4,
  artisan,
}: ProductCardProps) {
  const { addToCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: String(id), name, price, imageUrl: image });
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <div className="card-artisan group cursor-pointer">
      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <a className="block">
          <div className="aspect-square bg-muted rounded-lg mb-4 relative overflow-hidden">
            {badge && (
              <div className="absolute top-2 right-2 z-10">
                <span className={`${badge === 'sale' ? 'badge-sale' : badge === 'new' ? 'badge-new' : 'badge-artisan'}`}>
                  {badge.toUpperCase()}
                </span>
              </div>
            )}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:scale-105 transition-transform duration-300">
              {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl">🏺</span>
                  </div>
                  <span className="text-xs text-foreground/40 font-sans">Handcrafted Item</span>
                </div>
              )}
            </div>
            <button className="absolute top-2 left-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg">
              <Heart className="w-4 h-4 text-primary hover:fill-primary transition-colors" />
            </button>
          </div>
        </a>
      </Link>

      {/* Product Info */}
      <div className="space-y-2">
        <span className="text-sm text-secondary font-sans font-medium">{category}</span>

        <Link href={`/products/${id}`}>
          <a>
            <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h4>
          </a>
        </Link>

        <p className="text-sm text-foreground/60 line-clamp-2">
          {description}
        </p>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'fill-accent text-accent' : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
        )}

        {/* Artisan */}
        {artisan && (
          <p className="text-xs text-foreground/50 italic">
            by {artisan}
          </p>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-primary">${price}</span>
          <button
            onClick={handleAddToCart}
            className={`btn-artisan-outline py-2 px-4 text-sm hover:scale-95 transition-all ${
              isAdding ? 'bg-green-700 text-white border-green-700' : ''
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-4 h-4 inline mr-1" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 inline mr-1" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
