import { Link } from "wouter";
import { DynamicIcon } from './DynamicIcon';
import { ShoppingCart, Heart, Check } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";

interface ProductCardProps {
  id: number;
  name: string;
  category?: string;
  price: number;
  originalPrice?: number;
  badge?: 'Sale' | 'New' | 'Bestseller';
  imageUrl?: string;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  originalPrice,
  badge,
  imageUrl,
}: ProductCardProps) {
  const { addToCart } = useCartStore();
  const { data: theme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: id.toString(),
      name,
      price,
      imageUrl: imageUrl || null
    });
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1500);
  };
  return (
    <div className="product-card group relative">
      <Link href={`/products/${id}`}>
        <a className="block">
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-orange-200 to-blue-200 relative overflow-hidden rounded-t-lg">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-white/50 flex items-center justify-center">
                    <DynamicIcon icon={theme?.productFallbackIcon} fallback="Sparkles" className="w-12 h-12 text-primary/40" size={48} />
                  </div>
                  <span className="text-xs text-foreground/40">Producto sin imagen</span>
                </div>
              </div>
            )}

            {/* Badge */}
            {badge && (
              <div className="absolute top-3 right-3">
                {badge === 'Sale' && <span className="badge-sale">Sale</span>}
                {badge === 'New' && <span className="badge-new">New</span>}
                {badge === 'Bestseller' && <span className="badge-bestseller">Bestseller</span>}
              </div>
            )}

            {/* Wishlist Button */}
            <button
              className="absolute top-3 left-3 w-9 h-9 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-orange-50"
              onClick={(e) => {
                e.preventDefault();
                // Add to wishlist logic here
              }}
            >
              <Heart className="w-4 h-4 text-foreground hover:text-primary" />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {category && (
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                {category}
              </p>
            )}
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {name}
            </h3>

            {/* Price and Add to Cart */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {originalPrice && (
                  <span className="text-muted-foreground line-through text-sm">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-primary font-bold text-xl">
                  ${price.toFixed(2)}
                </span>
              </div>
              <button
                className={`p-2.5 rounded-md transition-all shadow-orange ${
                  isAdding
                    ? 'bg-green-500 text-white'
                    : 'bg-primary hover:bg-orange-600 text-white'
                }`}
                onClick={handleAddToCart}
              >
                {isAdding ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
}
