import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/models";
import { normalizeImageUrl } from "@/lib/image-utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 1500);
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
      <div className="relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={normalizeImageUrl(product.imageUrl) || ''}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-64 bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${product.imageUrl ? 'hidden' : ''}`}>
          <span className="text-6xl">🍓</span>
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-pink-primary">
            ₡{product.price.toLocaleString()}
          </span>
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              isAdding
                ? "bg-green-500 hover:bg-green-500"
                : "bg-pink-primary hover:bg-pink-600"
            } text-white`}
          >
            <i className={`fas ${isAdding ? "fa-check" : "fa-shopping-bag"}`}></i>
            <span>{isAdding ? "¡Agregado!" : "Agregar"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
