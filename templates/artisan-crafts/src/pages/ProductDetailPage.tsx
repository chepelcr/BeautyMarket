import { useRoute, Link } from 'wouter';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Leaf, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
  const [, params] = useRoute('/products/:id');
  const [quantity, setQuantity] = useState(1);

  // In a real app, you'd fetch the product by ID
  const product = {
    id: params?.id || '1',
    name: 'Handmade Ceramic Bowl',
    category: 'Pottery',
    description: 'Beautiful terracotta bowl, hand-thrown and glazed with natural earth tones. Each piece is unique and crafted with care by our talented artisan Maria Santos.',
    longDescription: 'This stunning ceramic bowl is a testament to traditional pottery techniques passed down through generations. Hand-thrown on the wheel and finished with a food-safe glaze, it features natural variations that make each piece truly one-of-a-kind. Perfect for serving salads, displaying fruit, or as a decorative centerpiece.',
    price: 48,
    rating: 5,
    reviewCount: 24,
    artisan: {
      name: 'Maria Santos',
      avatar: '👩‍🎨',
      bio: '15 years of experience creating functional pottery using traditional wheel-throwing techniques.',
    },
    materials: ['Natural clay', 'Food-safe glaze', 'Eco-friendly packaging'],
    dimensions: '8" diameter x 4" height',
    care: 'Hand wash recommended. Microwave and dishwasher safe.',
    madeIn: 'Portland, Oregon',
  };

  const relatedProducts = [
    {
      id: 7,
      name: 'Ceramic Planter Trio',
      category: 'Pottery',
      description: 'Three hand-painted planters in varying sizes.',
      price: 52,
      badge: null,
      rating: 5,
      artisan: 'Maria Santos',
    },
    {
      id: 4,
      name: 'Artisan Wood Serving Board',
      category: 'Home & Kitchen',
      description: 'Live-edge walnut serving board with food-safe finish.',
      price: 78,
      badge: 'featured' as const,
      rating: 5,
      artisan: 'Thomas Miller',
    },
    {
      id: 6,
      name: 'Handwoven Basket Set',
      category: 'Home Decor',
      description: 'Set of three natural seagrass baskets.',
      price: 89,
      badge: 'sale' as const,
      rating: 5,
      artisan: 'Aisha Patel',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container-organic py-4">
          <Link href="/products">
            <a className="inline-flex items-center text-foreground/60 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </a>
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="container-organic py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl overflow-hidden sticky top-20">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-8xl">🏺</span>
                  </div>
                  <span className="text-sm text-foreground/40 font-sans">Handcrafted Item</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-secondary font-sans font-medium">{product.category}</span>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < product.rating ? 'fill-accent text-accent' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-foreground/60">
                ({product.reviewCount} reviews)
              </span>
            </div>

            <p className="text-foreground/70 mb-6 leading-relaxed">
              {product.description}
            </p>

            <div className="text-4xl font-bold text-primary mb-8">
              ${product.price}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-3 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>

              <button className="btn-artisan flex-1 flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button className="btn-artisan-outline p-3">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Product Details Accordion */}
            <div className="space-y-4">
              <details className="card-artisan cursor-pointer group" open>
                <summary className="font-semibold text-lg flex items-center justify-between">
                  Description
                  <span className="text-primary">+</span>
                </summary>
                <div className="mt-4 text-foreground/70">
                  <p className="mb-4">{product.longDescription}</p>
                  <ul className="space-y-2">
                    <li><strong>Dimensions:</strong> {product.dimensions}</li>
                    <li><strong>Made in:</strong> {product.madeIn}</li>
                  </ul>
                </div>
              </details>

              <details className="card-artisan cursor-pointer group">
                <summary className="font-semibold text-lg flex items-center justify-between">
                  Materials & Care
                  <span className="text-primary">+</span>
                </summary>
                <div className="mt-4 text-foreground/70">
                  <p className="font-semibold mb-2">Materials:</p>
                  <ul className="list-disc list-inside mb-4">
                    {product.materials.map((material, i) => (
                      <li key={i}>{material}</li>
                    ))}
                  </ul>
                  <p className="font-semibold mb-2">Care Instructions:</p>
                  <p>{product.care}</p>
                </div>
              </details>

              <details className="card-artisan cursor-pointer group">
                <summary className="font-semibold text-lg flex items-center justify-between">
                  About the Artisan
                  <span className="text-primary">+</span>
                </summary>
                <div className="mt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-3xl">
                      {product.artisan.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{product.artisan.name}</h4>
                      <p className="text-sm text-secondary">{product.category} Artist</p>
                    </div>
                  </div>
                  <p className="text-foreground/70">{product.artisan.bio}</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              You May Also Like
            </h2>
            <p className="text-foreground/70">
              More handcrafted treasures from our artisans
            </p>
          </div>

          <div className="product-grid">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  { icon: Truck, label: 'Free Shipping' },
  { icon: Shield, label: 'Secure Payment' },
  { icon: RotateCcw, label: '30-Day Returns' },
  { icon: Leaf, label: 'Eco-Friendly' },
];
