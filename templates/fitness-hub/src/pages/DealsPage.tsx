import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "../components/DynamicIcon";
import { Link } from 'wouter';
import { Tag, Dumbbell } from 'lucide-react';
import { useProducts, useDealsPage, useTheme } from '@/hooks/useContent';
import { useCartStore } from '@/store/cart';

export default function DealsPage() {
  const { data: products = [], isLoading } = useProducts({ onSale: true });
  const { data: pageData, isLoading: pageLoading } = useDealsPage();
  const { data: theme } = useTheme();
  const { addToCart } = useCartStore();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-red-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg mb-4">
            <Tag className="w-5 h-5" />
            <span className="font-bold">{hero?.badge || 'OFERTAS ESPECIALES'}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="gradient-energy bg-clip-text text-transparent">{hero?.title || 'OFERTAS Y DESCUENTOS'}</span>
          </h1>
          <p className="text-xl text-gray-300">{hero?.subtitle || 'Descuentos masivos en equipamiento de fitness'}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-gray-900">{products.length}</span> DEALS AVAILABLE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="card-fitness animate-pulse h-96" />
            ))
          ) : (
            products.map((product: any) => (
              <div key={product.id} className="card-fitness overflow-hidden group cursor-pointer">
                <div className="aspect-square bg-gray-200 overflow-hidden relative">
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                      -{product.discount}%
                    </div>
                  )}
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 group-hover:scale-110 transition-transform duration-300"></div>
                </div>
                <div className="p-4">
                  <div className="text-xs font-bold text-orange-600 mb-1">{product.category}</div>
                  <h3 className="font-black text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                    )}
                    <span className="text-xl font-black text-red-600">${product.price}</span>
                  </div>
                  <button
                    onClick={() => addToCart({ id: product.id.toString(), name: product.name, price: product.price })}
                    className="w-full btn-energy text-xs py-2"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && products.length === 0 && (
          <div className="text-center py-16">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">NO DEALS RIGHT NOW</h3>
            <p className="text-gray-600 mb-6">Vuelve pronto para nuevas ofertas</p>
            <Link href="/products">
              <button className="btn-energy">VER PRODUCTOS</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
