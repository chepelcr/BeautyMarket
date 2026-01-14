import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Award, ShieldCheck, Sparkles, ShoppingCart, Check } from 'lucide-react';
import {
  VintageButton,
  VintageCard,
  VintageCardHeader,
  VintageCardContent,
  VintageBadge,
  VintageDivider,
  OrnateBorder,
} from '../components';
import { useCartStore } from '@/store/cart';

export function HomePage() {
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const { addToCart } = useCartStore();
  const featuredProducts = [
    {
      id: 1,
      name: '1950s Swing Dress',
      description: 'Classic A-line silhouette with pearl buttons and delicate lace trim.',
      price: 189,
      badge: 'bestseller' as const,
      emoji: '👗',
      gradient: 'from-burgundy-50 to-cream-100',
    },
    {
      id: 2,
      name: 'Tweed Overcoat',
      description: 'Authentic 1960s tweed coat with brass buttons. Fully lined.',
      price: 249,
      originalPrice: 349,
      badge: 'sale' as const,
      emoji: '🧥',
      gradient: 'from-mustard-50 to-cream-100',
    },
    {
      id: 3,
      name: 'Leather Handbag',
      description: 'Genuine leather handbag from the 1970s with gold hardware.',
      price: 159,
      badge: 'limited' as const,
      emoji: '👜',
      gradient: 'from-accent/20 to-cream-100',
    },
  ];

  const features = [
    {
      icon: <Award className="w-8 h-8 text-mustard-500" />,
      title: 'Authenticity Guaranteed',
      description: 'Every piece is verified and authenticated by vintage fashion experts.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-mustard-500" />,
      title: 'Quality Assured',
      description: 'Carefully inspected, restored, and preserved to the highest standards.',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-mustard-500" />,
      title: 'Curated Collection',
      description: 'Hand-selected pieces spanning decades of timeless fashion history.',
    },
  ];

  const handleAddToCart = (product: typeof featuredProducts[0]) => {
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cream-50 via-cream-100 to-burgundy-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <VintageBadge variant="new" className="mb-6 animate-pulse">
              New Collection
            </VintageBadge>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-burgundy-900 mb-6 leading-tight">
              Classic Styles,
              <br />
              <span className="text-mustard-500">Timeless Elegance</span>
            </h1>
            <p className="text-xl md:text-2xl font-body text-burgundy-900/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              Discover our curated collection of vintage-inspired fashion. Each piece tells a story
              of craftsmanship, quality, and enduring style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <VintageButton variant="primary" size="lg" className="w-full sm:w-auto">
                  Explore Collection
                  <ArrowRight className="ml-2" size={20} />
                </VintageButton>
              </Link>
              <VintageButton variant="secondary" size="lg" className="w-full sm:w-auto">
                View Lookbook
              </VintageButton>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border-4 border-burgundy-900/10 rounded-full hidden lg:block" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-mustard-500/20 rounded-full hidden lg:block" />
      </section>

      <VintageDivider text="Featured Collections" />

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <VintageCard key={product.id} hover>
              <VintageCardHeader>
                <div className={`aspect-square bg-gradient-to-br ${product.gradient} rounded-md flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="text-7xl mb-2">{product.emoji}</div>
                    <p className="text-sm font-serif text-burgundy-900">{product.name}</p>
                  </div>
                </div>
              </VintageCardHeader>
              <VintageCardContent>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-serif font-semibold text-burgundy-900">
                    {product.name}
                  </h3>
                  <VintageBadge variant={product.badge}>
                    {product.badge === 'bestseller' ? 'Best Seller' : product.badge === 'sale' ? 'Sale' : 'Limited'}
                  </VintageBadge>
                </div>
                <p className="text-sm font-body text-burgundy-900/70 mb-4 leading-relaxed">
                  {product.description}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-serif font-bold text-burgundy-900">
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
                </div>
              </VintageCardContent>
            </VintageCard>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/products">
            <VintageButton variant="secondary" size="lg">
              View All Products
              <ArrowRight className="ml-2" size={20} />
            </VintageButton>
          </Link>
        </div>
      </section>

      <VintageDivider text="Why Choose Us" />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <OrnateBorder key={index} variant="single" className="bg-card text-center">
              <div className="flex flex-col items-center">
                <div className="mb-4 p-4 bg-cream-100 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-serif font-bold text-burgundy-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm font-body text-burgundy-900/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </OrnateBorder>
          ))}
        </div>
      </section>

      <VintageDivider text="About Our Collection" />

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mb-12">
        <OrnateBorder variant="decorative" className="bg-card">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-burgundy-900 mb-6">
              Curated with Care
            </h2>
            <p className="text-lg font-body text-burgundy-900/80 mb-4 leading-relaxed">
              Every piece in our collection is carefully selected for its authenticity, quality,
              and timeless appeal. We believe that vintage fashion is more than just clothing—it's
              a celebration of craftsmanship, history, and individual style.
            </p>
            <p className="text-lg font-body text-burgundy-900/80 mb-8 leading-relaxed">
              From elegant 1950s dresses to sophisticated 1970s accessories, each item has been
              restored and preserved to ensure you receive the finest vintage pieces available.
            </p>
            <VintageButton variant="secondary" size="lg">
              Learn Our Story
            </VintageButton>
          </div>
        </OrnateBorder>
      </section>
    </div>
  );
}
