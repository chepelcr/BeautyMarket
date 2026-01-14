import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import RecipeCard from '../components/RecipeCard';
import { ArrowRight, Award, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { Link } from 'wouter';

export default function HomePage() {
  // Sample data
  const featuredProducts = [
    {
      id: '1',
      name: 'Aged Parmesan Reggiano',
      description: ' 24-month aged artisanal cheese from Italy',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500',
      rating: 5,
      reviewCount: 127,
      badges: [
        { type: 'premium' as const, label: 'Premium' },
        { type: 'organic' as const, label: 'Organic' },
      ],
    },
    {
      id: '2',
      name: 'Truffle-Infused Olive Oil',
      description: 'Extra virgin olive oil with black truffle essence',
      price: 34.99,
      salePrice: 27.99,
      onSale: true,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
      rating: 5,
      reviewCount: 89,
      badges: [{ type: 'premium' as const, label: 'Artisan' }],
    },
    {
      id: '3',
      name: 'Organic Raw Honey',
      description: 'Wild forest honey, unfiltered and unpasteurized',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784463?w=500',
      rating: 4,
      reviewCount: 156,
      badges: [
        { type: 'organic' as const, label: 'Organic' },
        { type: 'local' as const, label: 'Local' },
      ],
    },
    {
      id: '4',
      name: 'Artisan Sourdough Starter',
      description: 'Traditional sourdough culture from San Francisco',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
      rating: 5,
      reviewCount: 203,
      badges: [
        { type: 'fresh' as const, label: 'Fresh' },
        { type: 'local' as const, label: 'Local' },
      ],
    },
  ];

  const recipes = [
    {
      title: 'Classic Margherita Pizza',
      description: 'Authentic Italian pizza with fresh mozzarella, basil, and our premium tomato sauce',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
      prepTime: '30 min',
      servings: 4,
      difficulty: 'Medium' as const,
      featured: true,
    },
    {
      title: 'Truffle Risotto',
      description: 'Creamy arborio rice with black truffle and aged parmesan',
      image: 'https://images.unsplash.com/photo-1476124369491-c4991c2bfc4e?w=500',
      prepTime: '45 min',
      servings: 2,
      difficulty: 'Hard' as const,
    },
    {
      title: 'Artisan Cheese Board',
      description: 'Curated selection of our finest cheeses with accompaniments',
      image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500',
      prepTime: '15 min',
      servings: 6,
      difficulty: 'Easy' as const,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

          <div className="relative z-10 container mx-auto px-4 text-white">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in">
                Discover the Finest
                <span className="block text-gourmet-gold mt-2">Gourmet Foods</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-stone-200 animate-slide-up">
                Curated selection of premium artisanal foods from around the world
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up">
                <Link href="/products">
                  <a className="inline-flex items-center gap-2 bg-gourmet-red hover:bg-gourmet-gold text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl">
                    Shop Now
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Link>
                <a
                  href="#featured"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-white/30"
                >
                  Explore Collection
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-stone-50 border-y border-stone-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gourmet-red/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-gourmet-red" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">Premium Quality</h3>
                <p className="text-sm text-stone-600">
                  Hand-selected artisanal products from trusted producers
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gourmet-green/10 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="w-8 h-8 text-gourmet-green" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">Organic Options</h3>
                <p className="text-sm text-stone-600">
                  Wide selection of certified organic and natural foods
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gourmet-gold/10 rounded-full flex items-center justify-center mb-4">
                  <Truck className="w-8 h-8 text-gourmet-gold" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">Fast Delivery</h3>
                <p className="text-sm text-stone-600">
                  Temperature-controlled shipping to preserve freshness
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-stone-300/30 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-stone-700" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">Quality Guarantee</h3>
                <p className="text-sm text-stone-600">
                  100% satisfaction guarantee or your money back
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section id="featured" className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2">
                  Featured Products
                </h2>
                <p className="text-stone-600">Handpicked premium selection</p>
              </div>
              <Link href="/products">
                <a className="text-gourmet-red hover:text-gourmet-gold font-semibold flex items-center gap-2 transition-colors">
                  View All
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* Recipe Section */}
        <section className="py-16 bg-gourmet-cream">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-3">
                Gourmet Recipes
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                Discover delicious recipes created by our culinary experts using our premium
                ingredients
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recipes.map((recipe, idx) => (
                <RecipeCard key={idx} {...recipe} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-stone-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Join Our Culinary Community
            </h2>
            <p className="text-lg text-stone-300 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive recipes, product launches, and special
              offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-gourmet-gold"
              />
              <button className="bg-gourmet-red hover:bg-gourmet-gold px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
