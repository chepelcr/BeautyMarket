import React, { useState } from 'react';
import { Link } from 'wouter';
import { Filter, SlidersHorizontal, ShoppingCart, Check } from 'lucide-react';
import {
  VintageButton,
  VintageCard,
  VintageCardHeader,
  VintageCardContent,
  VintageBadge,
  VintageDivider,
} from '../components';
import { useCartStore } from '@/store/cart';

export function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const { addToCart } = useCartStore();

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'dresses', name: 'Dresses' },
    { id: 'coats', name: 'Coats & Jackets' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'shoes', name: 'Shoes' },
  ];

  const products = [
    {
      id: 1,
      name: '1950s Swing Dress',
      category: 'dresses',
      price: 189,
      badge: 'bestseller' as const,
      emoji: '👗',
      gradient: 'from-burgundy-50 to-cream-100',
    },
    {
      id: 2,
      name: 'Tweed Overcoat',
      category: 'coats',
      price: 249,
      originalPrice: 349,
      badge: 'sale' as const,
      emoji: '🧥',
      gradient: 'from-mustard-50 to-cream-100',
    },
    {
      id: 3,
      name: 'Leather Handbag',
      category: 'accessories',
      price: 159,
      badge: 'limited' as const,
      emoji: '👜',
      gradient: 'from-accent/20 to-cream-100',
    },
    {
      id: 4,
      name: 'Silk Scarf',
      category: 'accessories',
      price: 45,
      badge: 'new' as const,
      emoji: '🧣',
      gradient: 'from-cream-100 to-mustard-50',
    },
    {
      id: 5,
      name: 'Vintage Heels',
      category: 'shoes',
      price: 129,
      badge: 'vintage' as const,
      emoji: '👠',
      gradient: 'from-burgundy-50 to-accent/20',
    },
    {
      id: 6,
      name: 'Wool Peacoat',
      category: 'coats',
      price: 299,
      badge: 'bestseller' as const,
      emoji: '🧥',
      gradient: 'from-cream-100 to-burgundy-50',
    },
    {
      id: 7,
      name: 'Tea Length Dress',
      category: 'dresses',
      price: 169,
      badge: 'vintage' as const,
      emoji: '👗',
      gradient: 'from-mustard-50 to-cream-100',
    },
    {
      id: 8,
      name: 'Pearl Necklace',
      category: 'accessories',
      price: 89,
      badge: 'new' as const,
      emoji: '📿',
      gradient: 'from-cream-50 to-cream-100',
    },
    {
      id: 9,
      name: 'Velvet Evening Gown',
      category: 'dresses',
      price: 379,
      badge: 'limited' as const,
      emoji: '👗',
      gradient: 'from-burgundy-100 to-accent/30',
    },
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: null,
    });
    setAddingToCart(product.id);
    setTimeout(() => setAddingToCart(null), 1500);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-cream-50 via-cream-100 to-burgundy-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-burgundy-900 mb-4">
              Our Collection
            </h1>
            <p className="text-xl font-body text-burgundy-900/80 max-w-2xl mx-auto">
              Browse our carefully curated selection of vintage fashion pieces
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Sorting */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 font-serif text-sm tracking-wider uppercase rounded-md border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-burgundy-900 text-cream-50 border-burgundy-900'
                    : 'bg-card text-burgundy-900 border-burgundy-900/30 hover:border-burgundy-900'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} className="text-burgundy-900" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 font-serif text-sm border-2 border-burgundy-900/30 rounded-md bg-card text-burgundy-900 focus:border-burgundy-900 outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm font-body text-burgundy-900/70">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <VintageCard key={product.id} hover>
              <VintageCardHeader>
                <div className={`aspect-square bg-gradient-to-br ${product.gradient} rounded-md flex items-center justify-center relative`}>
                  <div className="text-center">
                    <div className="text-6xl mb-2">{product.emoji}</div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <VintageBadge variant={product.badge}>
                      {product.badge === 'bestseller' ? 'Best' : product.badge}
                    </VintageBadge>
                  </div>
                </div>
              </VintageCardHeader>
              <VintageCardContent>
                <h3 className="text-lg font-serif font-semibold text-burgundy-900 mb-3">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xl font-serif font-bold text-burgundy-900">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm font-body text-burgundy-900/50 line-through ml-2">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <VintageButton variant="outline" size="sm" className="w-full">
                      View Details
                    </VintageButton>
                  </Link>
                  <VintageButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className={addingToCart === product.id ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {addingToCart === product.id ? <Check size={18} /> : <ShoppingCart size={18} />}
                  </VintageButton>
                </div>
              </VintageCardContent>
            </VintageCard>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Filter size={48} className="mx-auto text-burgundy-900/30 mb-4" />
            <h3 className="text-2xl font-serif font-bold text-burgundy-900 mb-2">
              No items found
            </h3>
            <p className="text-burgundy-900/70 font-body mb-6">
              Try adjusting your filters to see more products
            </p>
            <VintageButton variant="secondary" onClick={() => setSelectedCategory('all')}>
              Clear Filters
            </VintageButton>
          </div>
        )}
      </section>

      <VintageDivider />

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gradient-to-br from-burgundy-900 to-burgundy-800 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-cream-50 mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg font-body text-cream-50/80 mb-6 max-w-2xl mx-auto">
            We're constantly adding new pieces to our collection. Sign up for our newsletter to be
            the first to know about new arrivals.
          </p>
          <VintageButton variant="secondary" size="lg">
            Subscribe to Newsletter
          </VintageButton>
        </div>
      </section>
    </div>
  );
}
