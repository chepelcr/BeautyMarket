import { Link } from "wouter";
import { ShoppingCart, Heart, Star, Sparkles, Check } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  image,
  rating,
  reviews,
  isNew = false,
  isBestseller = false,
}: ProductCardProps) {
  const { addToCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    addToCart({ id, name, price, imageUrl: image });
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1500);
  };
  return (
    <div className="product-card-beauty group border border-border">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-beauty-cream aspect-square">
        <Link href={`/products/${id}`}>
          <a className="block w-full h-full">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </a>
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NEW
            </span>
          )}
          {isBestseller && (
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
          aria-label="Add to wishlist"
        >
          <Heart className="w-5 h-5" />
        </button>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToCart}
            className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
              isAdding
                ? "bg-green-500 text-white"
                : "bg-white text-primary hover:bg-primary hover:text-white"
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-5 h-5" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
          {category}
        </p>

        {/* Product Name */}
        <Link href={`/products/${id}`}>
          <a className="block">
            <h3 className="font-serif font-bold text-foreground text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
              {name}
            </h3>
          </a>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-primary">${price.toFixed(2)}</p>
          <button
            onClick={handleAddToCart}
            className={`p-2 rounded-full transition-all ${
              isAdding
                ? "bg-green-500 text-white"
                : "bg-secondary hover:bg-primary hover:text-white"
            }`}
            aria-label="Add to cart"
          >
            {isAdding ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
