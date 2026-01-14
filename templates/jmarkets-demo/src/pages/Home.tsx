import { Link } from "wouter";
import { Zap, Shield, TruckIcon, ShoppingCart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { useProducts, useCategories, useHomePage } from "@/hooks/useContent";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";

export default function Home() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: pageData } = useHomePage();
  const featuredProducts = products.slice(0, 4);

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content || {};
  const benefits = getSectionByType(sections, 'benefits')?.content || {};
  const cta = getSectionByType(sections, 'cta')?.content || {};

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-orange-blue py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {hero.title || 'Your Marketplace for Everything'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {hero.subtitle || 'Discover amazing products from trusted sellers worldwide'}
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/products">
                <a className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg transition-colors shadow-lg">
                  {hero.ctaPrimary || 'Shop Now'}
                </a>
              </Link>
              <button className="bg-blue-900 hover:bg-blue-950 px-8 py-3 rounded-md font-semibold text-lg transition-colors shadow-lg">
                {hero.ctaSecondary || 'Learn More'}
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
            {(benefits.items || [{icon: 'Zap', title: 'Fast Delivery', description: 'Get your orders delivered quickly and reliably'}, {icon: 'Shield', title: 'Secure Payments', description: 'Shop with confidence using our secure checkout'}, {icon: 'ShoppingCart', title: 'Easy Returns', description: 'Hassle-free returns within 30 days'}, {icon: 'TruckIcon', title: 'Free Shipping', description: 'On orders over $50'}]).map((benefit: any, index: number) => {
              const iconMap: any = { Zap, Shield, ShoppingCart, TruckIcon };
              const Icon = iconMap[benefit.icon] || Zap;
              return (
                <div key={index} className="card-modern p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
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
            {categoriesLoading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32" />)
            ) : (
              categories.map((category: any) => <CategoryCard key={category.id} {...category} />)
            )}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-muted-foreground">
              Handpicked favorites just for you
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsLoading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-80" />)
            ) : (
              featuredProducts.map((product: any) => <ProductCard key={product.id} {...product} />)
            )}
          </div>
          <div className="text-center mt-12">
            <Link href="/products">
              <a className="btn-primary px-8 py-3 rounded-md font-semibold text-lg inline-block shadow-orange">
                Ver Todos los Productos
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-16 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {cta.title || 'Ready to Start Shopping?'}
          </h2>
          <p className="text-xl mb-8 text-white/90">
            {cta.description || 'Join thousands of happy customers and discover amazing deals today'}
          </p>
          <Link href="/products">
            <a className="bg-primary hover:bg-orange-600 px-8 py-3 rounded-md font-semibold text-lg inline-block transition-colors shadow-lg">
              {cta.buttonText || 'Browse Products'}
            </a>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
