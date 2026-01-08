import { Link } from "wouter";
import { Zap, Shield, TruckIcon, ShoppingCart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";

export default function Home() {
  const featuredProducts = [
    { id: 1, name: "Premium Wireless Headphones", category: "Electronics", price: 89.99, originalPrice: 129.99, badge: "Sale" as const },
    { id: 2, name: "Designer Leather Wallet", category: "Fashion", price: 79.99, originalPrice: 99.99, badge: "New" as const },
    { id: 3, name: "Smart Home Speaker", category: "Electronics", price: 69.99, originalPrice: 99.99, badge: "Bestseller" as const },
    { id: 4, name: "Organic Cotton T-Shirt", category: "Fashion", price: 59.99, originalPrice: 79.99, badge: "Sale" as const },
  ];

  const categories = [
    { name: "Electronics", description: "Latest gadgets and tech accessories", productCount: 125 },
    { name: "Fashion", description: "Trending styles and timeless classics", productCount: 234 },
    { name: "Home & Garden", description: "Everything for your living space", productCount: 189 },
    { name: "Sports & Fitness", description: "Gear up for an active lifestyle", productCount: 156 },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-orange-blue py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Marketplace for Everything
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Discover amazing products from trusted sellers worldwide
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/products">
                <a className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg transition-colors shadow-lg">
                  Shop Now
                </a>
              </Link>
              <button className="bg-blue-900 hover:bg-blue-950 px-8 py-3 rounded-md font-semibold text-lg transition-colors shadow-lg">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Shop With Us?
            </h2>
            <p className="text-lg text-muted-foreground">
              The best shopping experience, guaranteed
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-modern p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">Get your orders delivered quickly and reliably</p>
            </div>
            <div className="card-modern p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-800 rounded-full mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">Shop with confidence using our secure checkout</p>
            </div>
            <div className="card-modern p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-full mb-4">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
              <p className="text-muted-foreground">Hassle-free returns within 30 days</p>
            </div>
            <div className="card-modern p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-4">
                <TruckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-muted-foreground">On orders over $50</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-muted-foreground">
              Find exactly what you're looking for
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground">
              Handpicked favorites just for you
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products">
              <a className="btn-primary px-8 py-3 rounded-md font-semibold text-lg inline-block shadow-orange">
                View All Products
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-16 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of happy customers and discover amazing deals today
          </p>
          <Link href="/products">
            <a className="bg-primary hover:bg-orange-600 px-8 py-3 rounded-md font-semibold text-lg inline-block transition-colors shadow-lg">
              Browse Products
            </a>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
