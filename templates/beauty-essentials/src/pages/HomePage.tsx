import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { DynamicIcon } from "@/components/DynamicIcon";
import { useProducts, useHomePage, useTheme } from "@/hooks/useContent";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import {
  Sparkles,
  Heart,
  Leaf,
  Award,
  ShieldCheck,
  ArrowRight,
  Star,
} from "lucide-react";

export default function HomePage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: pageData, isLoading: pageLoading } = useHomePage();
  const { data: theme } = useTheme();
  const featuredProducts = products.slice(0, 4);

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content || {};
  const benefits = getSectionByType(sections, 'benefits')?.content || {};
  const cta = getSectionByType(sections, 'cta')?.content || {};
  const testimonials = getSectionByType(sections, 'testimonials')?.content || {};
  const featured = getSectionByType(sections, 'featured')?.content || {};

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <DynamicIcon icon={theme?.loadingIcon} fallback="Sparkles" className="w-12 h-12 text-primary" size={48} />
          </div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {hero.badge || 'New Collection Available'}
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight">
                {hero.title || 'Discover Your Natural Beauty'}
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                {hero.subtitle || 'Premium cosmetics and skincare products crafted with natural ingredients'}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/products">
                  <a className="btn-beauty flex items-center gap-2">
                    {hero.ctaPrimary || 'Shop Now'}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Link>
                <button className="btn-beauty-outline">{hero.ctaSecondary || 'Learn More'}</button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                {(hero.stats || [{label: 'Happy Customers', value: '10K+'}, {label: 'Premium Products', value: '50+'}, {label: 'Natural & Safe', value: '100%'}]).map((stat: any, i: number) => (
                  <div key={i}>
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-beauty-lg">
                <img
                  src={hero.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'}
                  alt="Beauty products"
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-beauty">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">4.9/5.0</p>
                    <p className="text-sm text-muted-foreground">Calificación de Clientes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(benefits.items || []).map((benefit: any, index: number) => {
              const iconMap: any = { Leaf, ShieldCheck, Heart, Award };
              const Icon = iconMap[benefit.icon] || Sparkles;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl hover:bg-pink-50 transition-colors"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-foreground text-xl mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* {featured.title || 'Productos Destacados'} Section */}
      <section className="py-20 section-cream">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {featured.badge || 'Más Vendidos'}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              {featured.title || 'Productos Destacados'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {featured.subtitle || 'Descubre nuestros productos más amados, seleccionados para tu rutina de cuidado'}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-pink-50 rounded-2xl h-96" />
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            )}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link href="/products">
              <a className="btn-beauty-outline inline-flex items-center gap-2">
                Ver Todos los Productos
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 beauty-gradient text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              {cta.title || 'Join Our Beauty Community'}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {cta.description || 'Get exclusive access to new products, beauty tips, and special offers'}
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-primary rounded-lg font-bold hover:bg-pink-50 transition-colors whitespace-nowrap"
              >
                {cta.buttonText || 'Subscribe'}
              </button>
            </form>
            <p className="text-sm mt-4 opacity-75">
              Únete a {cta.subscriberCount || '10,000+'} {cta.subscriberText || 'amantes de la belleza ya suscritos'}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white" id="about">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              {testimonials.title || 'What Our Customers Say'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {testimonials.description || 'Real stories from real people who love our products'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(testimonials.items || []).map((testimonial: any, index: number) => (
              <div
                key={index}
                className="bg-pink-50 p-8 rounded-2xl hover:shadow-beauty transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {testimonial.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
