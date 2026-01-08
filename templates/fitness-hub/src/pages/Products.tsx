import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCartStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">
            SHOP <span className="gradient-energy bg-clip-text text-transparent">EQUIPMENT</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Premium fitness gear for champions
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
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-red-600 transition-colors">
                <Filter className="w-5 h-5" />
                <span className="font-bold">FILTER</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-red-600 transition-colors">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="font-bold">SORT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <div className="p-4">
                <div className="text-xs font-bold text-orange-600 mb-1">
                  {product.category}
                </div>
                <h3 className="font-black text-gray-900 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-red-600">
                    ${product.price}
                  </span>
                  <button
                    onClick={() => addToCart({
                      id: product.id.toString(),
                      name: product.name,
                      price: product.price,
                    })}
                    className="btn-energy text-xs py-2 px-3"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const products = [
  {
    id: 1,
    name: 'Pro Dumbbells',
    category: 'STRENGTH',
    price: 299,
    badge: 'BESTSELLER',
  },
  {
    id: 2,
    name: 'Rowing Machine',
    category: 'CARDIO',
    price: 899,
    badge: null,
  },
  {
    id: 3,
    name: 'Yoga Mat',
    category: 'ACCESSORIES',
    price: 49,
    badge: 'NEW',
  },
  {
    id: 4,
    name: 'Resistance Bands',
    category: 'STRENGTH',
    price: 29,
    badge: null,
  },
  {
    id: 5,
    name: 'Kettlebell Set',
    category: 'STRENGTH',
    price: 199,
    badge: null,
  },
  {
    id: 6,
    name: 'Jump Rope',
    category: 'CARDIO',
    price: 19,
    badge: null,
  },
  {
    id: 7,
    name: 'Foam Roller',
    category: 'RECOVERY',
    price: 39,
    badge: null,
  },
  {
    id: 8,
    name: 'Power Rack',
    category: 'STRENGTH',
    price: 1299,
    badge: 'PREMIUM',
  },
];
