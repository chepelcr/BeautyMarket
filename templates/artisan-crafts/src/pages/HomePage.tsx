import { Link } from 'wouter';
import { DynamicIcon } from '@/components/DynamicIcon';
import { Sparkles, Leaf, Package, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-artisan">
        <div className="container-organic relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-accent animate-wiggle" />
            <span className="badge-artisan">Handcrafted with Love</span>
            <Sparkles className="w-6 h-6 text-accent animate-wiggle" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-shadow">
            Discover Unique
            <br />
            <span className="text-gradient-artisan">Handmade Treasures</span>
          </h2>
          <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
            Every piece tells a story. Shop authentic handcrafted goods made by skilled artisans
            using traditional techniques and sustainable materials.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <a className="btn-artisan">
                <Package className="w-5 h-5 inline mr-2" />
                Explore Collections
              </a>
            </Link>
            <button className="btn-artisan-outline">
              <Heart className="w-5 h-5 inline mr-2" />
              Meet Our Artisans
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-textured py-16">
        <div className="container-organic">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Handmade?
            </h3>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Each item is thoughtfully created with care, attention to detail, and a passion for quality craftsmanship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-artisan text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h4>
                <p className="text-foreground/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section className="py-16 bg-background">
        <div className="container-organic">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 mb-4">
              <span className="badge-new">New Arrivals</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Artículos Artesanales Destacados
            </h3>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Browse our curated selection of artisan-made products, each with its own unique story.
            </p>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                category={product.category}
                badge={product.badge}
                rating={product.rating}
                artisan={product.artisan}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <a className="btn-artisan inline-flex items-center gap-2">
                Ver Todos los Productos
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Artisan Spotlight */}
      <section className="section-textured py-16">
        <div className="container-organic">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Meet Our Artisans
            </h3>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              The talented makers behind every unique piece
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {artisans.map((artisan, index) => (
              <div key={index} className="card-artisan text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <span className="text-4xl">{artisan.avatar}</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  {artisan.name}
                </h4>
                <p className="text-sm text-secondary font-medium mb-3">
                  {artisan.specialty}
                </p>
                <p className="text-sm text-foreground/70">
                  {artisan.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background">
        <div className="container-organic text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-foreground mb-6">
              Support Local Artisans
            </h3>
            <p className="text-lg text-foreground/70 mb-8">
              Every purchase directly supports independent makers and their craft. Join our community
              of people who value quality, authenticity, and sustainability.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products">
                <a className="btn-artisan">
                  <ShoppingBag className="w-5 h-5 inline mr-2" />
                  Start Shopping
                </a>
              </Link>
              <button className="btn-artisan-secondary">
                Become an Artisan
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    description: 'Eco-friendly and ethically sourced materials that respect our planet.',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Every piece is handcrafted with dedication and passion by skilled artisans.',
  },
  {
    icon: Sparkles,
    title: 'Unique & Original',
    description: 'No two items are exactly alike - own something truly one-of-a-kind.',
  },
];

const featuredProducts = [
  {
    id: 1,
    name: 'Handmade Ceramic Bowl',
    category: 'Pottery',
    description: 'Beautiful terracotta bowl, hand-thrown and glazed with natural earth tones.',
    price: 48,
    badge: 'sale' as const,
    rating: 5,
    artisan: 'Maria Santos',
  },
  {
    id: 2,
    name: 'Woven Macramé Wall Hanging',
    category: 'Textiles',
    description: 'Intricate boho-style wall art made from organic cotton rope.',
    price: 65,
    badge: 'new' as const,
    rating: 5,
    artisan: 'Sophie Chen',
  },
  {
    id: 3,
    name: 'Handcrafted Leather Journal',
    category: 'Accessories',
    description: 'Premium leather journal with hand-stitched binding and recycled paper.',
    price: 42,
    badge: null,
    rating: 4,
    artisan: 'James Cooper',
  },
  {
    id: 4,
    name: 'Artisan Wood Serving Board',
    category: 'Home & Kitchen',
    description: 'Live-edge walnut serving board with food-safe mineral oil finish.',
    price: 78,
    badge: 'featured' as const,
    rating: 5,
    artisan: 'Thomas Miller',
  },
  {
    id: 5,
    name: 'Hand-Painted Silk Scarf',
    category: 'Fashion',
    description: 'Luxurious silk scarf with original watercolor designs.',
    price: 55,
    badge: null,
    rating: 4,
    artisan: 'Elena Rodriguez',
  },
  {
    id: 6,
    name: 'Handwoven Basket Set',
    category: 'Home Decor',
    description: 'Set of three natural seagrass baskets, perfect for storage.',
    price: 89,
    badge: 'sale' as const,
    rating: 5,
    artisan: 'Aisha Patel',
  },
];

const artisans = [
  {
    name: 'Maria Santos',
    specialty: 'Ceramic Artist',
    bio: '15 years of experience creating functional pottery using traditional wheel-throwing techniques.',
    avatar: '👩‍🎨',
  },
  {
    name: 'James Cooper',
    specialty: 'Leather Craftsman',
    bio: 'Specializes in hand-stitched leather goods using vegetable-tanned leather.',
    avatar: '👨‍🔧',
  },
  {
    name: 'Sophie Chen',
    specialty: 'Textile Designer',
    bio: 'Creates contemporary macramé pieces blending modern and traditional fiber arts.',
    avatar: '👩‍💼',
  },
];
