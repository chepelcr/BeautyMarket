import { useState } from 'react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useProducts, useTheme } from '@/hooks/useContent';

export default function Products() {
  const { data: products = [], isLoading } = useProducts();
  const { data: theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCartStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">
            Tienda de <span className="gradient-energy bg-clip-text text-transparent">EQUIPOS</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Equipo de fitness premium para campeones
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-red-600 transition-colors">
                <Filter className="w-5 h-5" />
                <span className="font-bold">FILTRAR</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-red-600 transition-colors">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="font-bold">ORDENAR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="card-fitness animate-pulse h-96" />)
          ) : (
            products.map((product: any) => (
            <div
              key={product.id}
              className="card-fitness overflow-hidden group cursor-pointer"
            >
              <div className="aspect-square bg-gray-200 overflow-hidden relative">
                {product.badge && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {product.badge}
                  </div>
                )}
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-white/50 flex items-center justify-center">
                        <span className="text-5xl">{theme?.productFallbackIcon || '💪'}</span>
                      </div>
                      <span className="text-xs text-gray-500">Producto sin imagen</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-xs font-bold text-orange-600 mb-1">
                  {product.category}
                </div>
                <h3 className="font-black text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black">${product.price}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="btn-energy px-4 py-2 text-sm"
                  >
                    AGREGAR AL CARRITO
                  </button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}
