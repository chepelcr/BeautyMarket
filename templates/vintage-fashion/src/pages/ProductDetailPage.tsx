import React, { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, Heart, Share2, Star, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import {
  VintageButton,
  VintageCard,
  VintageCardContent,
  VintageBadge,
  VintageDivider,
  OrnateBorder,
} from '../components';

export function ProductDetailPage() {
  const [, params] = useRoute('/products/:id');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock product data (in real app, fetch by params.id)
  const product = {
    id: params?.id || '1',
    name: '1950s Swing Dress',
    description: 'Elegant vintage swing dress from the 1950s featuring a classic A-line silhouette with pearl buttons and delicate lace trim. Perfect for special occasions and timeless style.',
    price: 189,
    originalPrice: 249,
    badge: 'bestseller' as const,
    emoji: '👗',
    gradient: 'from-burgundy-50 to-cream-100',
    rating: 4.8,
    reviews: 24,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    details: [
      'Era: 1950s',
      'Material: 100% Cotton with lace detailing',
      'Condition: Excellent vintage condition',
      'Dry clean only',
      'Made in USA',
    ],
    features: [
      'Pearl button closure',
      'Delicate lace trim on bodice',
      'Full A-line skirt',
      'Fitted waist',
      'Concealed back zipper',
    ],
  };

  const relatedProducts = [
    {
      id: 2,
      name: 'Pearl Necklace',
      price: 89,
      emoji: '📿',
      gradient: 'from-cream-50 to-cream-100',
    },
    {
      id: 3,
      name: 'Vintage Heels',
      price: 129,
      emoji: '👠',
      gradient: 'from-burgundy-50 to-accent/20',
    },
    {
      id: 4,
      name: 'Silk Scarf',
      price: 45,
      emoji: '🧣',
      gradient: 'from-cream-100 to-mustard-50',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <section className="bg-cream-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm font-body text-burgundy-900/70">
            <Link href="/">
              <a className="hover:text-burgundy-900 transition-colors">Home</a>
            </Link>
            <span>/</span>
            <Link href="/products">
              <a className="hover:text-burgundy-900 transition-colors">Collection</a>
            </Link>
            <span>/</span>
            <span className="text-burgundy-900 font-semibold">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Back Button */}
      <section className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/products">
          <a className="inline-flex items-center gap-2 text-burgundy-900 hover:text-mustard-500 transition-colors font-serif">
            <ArrowLeft size={20} />
            Back to Collection
          </a>
        </Link>
      </section>

      {/* Product Details */}
      <section className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <OrnateBorder variant="decorative" className="bg-card">
              <div className={`aspect-square bg-gradient-to-br ${product.gradient} rounded-md flex items-center justify-center relative`}>
                <div className="text-center">
                  <div className="text-9xl mb-4">{product.emoji}</div>
                  <p className="text-xl font-serif text-burgundy-900">{product.name}</p>
                </div>
                <div className="absolute top-4 left-4">
                  <VintageBadge variant={product.badge}>Best Seller</VintageBadge>
                </div>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 p-3 bg-cream-50 rounded-full hover:bg-cream-100 transition-colors"
                >
                  <Heart
                    size={24}
                    className={isFavorite ? 'fill-burgundy-900 text-burgundy-900' : 'text-burgundy-900'}
                  />
                </button>
              </div>
            </OrnateBorder>

            {/* Thumbnail Gallery (placeholder) */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`aspect-square bg-gradient-to-br ${product.gradient} rounded-md border-2 border-burgundy-900/30 cursor-pointer hover:border-burgundy-900 transition-colors`}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-burgundy-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating) ? 'fill-mustard-500 text-mustard-500' : 'text-burgundy-900/30'}
                  />
                ))}
              </div>
              <span className="text-sm font-body text-burgundy-900/70">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-serif font-bold text-burgundy-900">
                ${product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl font-body text-burgundy-900/50 line-through">
                    ${product.originalPrice}
                  </span>
                  <VintageBadge variant="sale">
                    Save ${product.originalPrice - product.price}
                  </VintageBadge>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-lg font-body text-burgundy-900/80 mb-8 leading-relaxed">
              {product.description}
            </p>

            <VintageDivider className="my-6" />

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-serif font-semibold text-burgundy-900 mb-3 tracking-wider uppercase">
                Select Size
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 font-serif border-2 rounded-md transition-all ${
                      selectedSize === size
                        ? 'bg-burgundy-900 text-cream-50 border-burgundy-900'
                        : 'bg-card text-burgundy-900 border-burgundy-900/30 hover:border-burgundy-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-serif font-semibold text-burgundy-900 mb-3 tracking-wider uppercase">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border-2 border-burgundy-900/30 rounded-md font-serif text-burgundy-900 hover:border-burgundy-900 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-serif font-bold text-burgundy-900 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 border-2 border-burgundy-900/30 rounded-md font-serif text-burgundy-900 hover:border-burgundy-900 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <VintageButton variant="primary" size="lg" className="flex-1">
                Add to Cart
              </VintageButton>
              <VintageButton variant="outline" size="lg">
                <Share2 size={20} />
              </VintageButton>
            </div>

            {/* Features */}
            <VintageCard className="mb-6">
              <VintageCardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Truck size={24} className="text-mustard-500 mb-2" />
                    <p className="text-xs font-serif text-burgundy-900">Free Shipping</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <RotateCcw size={24} className="text-mustard-500 mb-2" />
                    <p className="text-xs font-serif text-burgundy-900">30-Day Returns</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <ShieldCheck size={24} className="text-mustard-500 mb-2" />
                    <p className="text-xs font-serif text-burgundy-900">Authenticity Guaranteed</p>
                  </div>
                </div>
              </VintageCardContent>
            </VintageCard>

            {/* Product Details Accordion */}
            <OrnateBorder variant="single">
              <div>
                <h3 className="text-xl font-serif font-bold text-burgundy-900 mb-4">
                  Product Details
                </h3>
                <ul className="space-y-2 mb-6">
                  {product.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm font-body text-burgundy-900/80">
                      <span className="text-mustard-500 mt-1">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-serif font-bold text-burgundy-900 mb-4">
                  Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm font-body text-burgundy-900/80">
                      <span className="text-mustard-500 mt-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </OrnateBorder>
          </div>
        </div>
      </section>

      <VintageDivider text="Complete the Look" />

      {/* Related Products */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedProducts.map((item) => (
            <VintageCard key={item.id} hover>
              <div className={`aspect-square bg-gradient-to-br ${item.gradient} rounded-md flex items-center justify-center`}>
                <div className="text-center">
                  <div className="text-7xl mb-2">{item.emoji}</div>
                </div>
              </div>
              <VintageCardContent>
                <h3 className="text-lg font-serif font-semibold text-burgundy-900 mb-3">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-serif font-bold text-burgundy-900">
                    ${item.price}
                  </span>
                  <Link href={`/products/${item.id}`}>
                    <VintageButton variant="outline" size="sm">
                      View
                    </VintageButton>
                  </Link>
                </div>
              </VintageCardContent>
            </VintageCard>
          ))}
        </div>
      </section>
    </div>
  );
}
