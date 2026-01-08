import React from 'react';
import { useRoute, Link } from 'wouter';
import { ShoppingCart, Heart, Star, Truck, Shield, RefreshCw, ChevronLeft } from 'lucide-react';
import { Product } from '../components/ProductCard';
import { PawIcon } from '../components/PawPrintDecoration';

// Mock product data (in a real app, this would come from an API)
const mockProduct: Product = {
  id: '1',
  name: 'Premium Dog Food - Chicken & Rice',
  description: 'High-quality nutrition for adult dogs. Made with real chicken and wholesome grains for optimal health and energy.',
  price: 49.99,
  image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&h=800&fit=crop',
  category: 'Dog Food',
  rating: 4.5,
  reviews: 128,
  inStock: true,
  badge: 'Best Seller',
};

const ProductDetailPage: React.FC = () => {
  const [match, params] = useRoute('/products/:id');
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [isFavorite, setIsFavorite] = React.useState(false);

  // Mock additional images
  const productImages = [
    mockProduct.image,
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&h=800&fit=crop&sat=-50',
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&h=800&fit=crop&contrast=120',
  ];

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    console.log(`Added ${quantity} items to cart`);
    // In a real app, this would update cart state
  };

  return (
    <div className="relative z-10">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/">
              <a className="text-muted-foreground hover:text-primary transition-colors">Home</a>
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/products">
              <a className="text-muted-foreground hover:text-primary transition-colors">Products</a>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{mockProduct.category}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Link href="/products">
          <a className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Products</span>
          </a>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="bg-muted/30 rounded-3xl overflow-hidden mb-4 aspect-square relative">
              <img
                src={productImages[selectedImage]}
                alt={mockProduct.name}
                className="w-full h-full object-cover"
              />
              {mockProduct.badge && (
                <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {mockProduct.badge}
                </div>
              )}
              <div className="absolute bottom-4 right-4 opacity-20">
                <PawIcon className="w-24 h-24 text-primary" />
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-2xl overflow-hidden border-4 transition-all ${
                    selectedImage === index
                      ? 'border-primary shadow-lg'
                      : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Product view ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">
                {mockProduct.category}
              </span>
              {mockProduct.inStock && (
                <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-lg">
                  In Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {mockProduct.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(mockProduct.rating)
                        ? 'text-secondary fill-secondary'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-foreground font-medium">
                {mockProduct.rating} / 5
              </span>
              <span className="text-muted-foreground">
                ({mockProduct.reviews} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {mockProduct.description}
            </p>

            {/* Extended Description */}
            <div className="bg-muted/30 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-foreground mb-3">Product Details</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Made with high-quality, natural ingredients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>No artificial colors, flavors, or preservatives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Balanced nutrition for adult dogs of all breeds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Supports healthy digestion and immune system</span>
                </li>
              </ul>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-primary">
                ${mockProduct.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground">per bag (15 lbs)</span>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-12 h-12 rounded-xl bg-muted hover:bg-primary/10 text-foreground font-bold transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-foreground w-16 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-12 h-12 rounded-xl bg-muted hover:bg-primary/10 text-foreground font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`px-6 py-4 rounded-2xl font-bold transition-all ${
                  isFavorite
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-primary/10'
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`}
                />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Truck className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground text-sm">Free Shipping</div>
                  <div className="text-xs text-muted-foreground">Orders over $50</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                <Shield className="w-6 h-6 text-secondary flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground text-sm">Quality Guaranteed</div>
                  <div className="text-xs text-muted-foreground">100% satisfaction</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
                <RefreshCw className="w-6 h-6 text-accent flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground text-sm">Easy Returns</div>
                  <div className="text-xs text-muted-foreground">30-day policy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
