import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import {
  Sparkles,
  Heart,
  Leaf,
  Award,
  ShieldCheck,
  ArrowRight,
  Star,
} from "lucide-react";

const featuredProducts = [
  {
    id: "1",
    name: "Radiant Glow Vitamin C Serum",
    category: "Skincare",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
    rating: 5,
    reviews: 234,
    isNew: true,
  },
  {
    id: "2",
    name: "Luxe Velvet Matte Lipstick - Rose",
    category: "Makeup",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80",
    rating: 5,
    reviews: 189,
    isBestseller: true,
  },
  {
    id: "3",
    name: "Hydrating Rose Water Facial Mist",
    category: "Skincare",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500&q=80",
    rating: 4,
    reviews: 156,
  },
  {
    id: "4",
    name: "Nourishing Night Cream with Retinol",
    category: "Skincare",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&q=80",
    rating: 5,
    reviews: 298,
    isBestseller: true,
  },
];

const benefits = [
  {
    icon: Leaf,
    title: "Natural Ingredients",
    description: "Formulated with organic, plant-based ingredients",
  },
  {
    icon: ShieldCheck,
    title: "Dermatologist Tested",
    description: "Clinically tested and approved for all skin types",
  },
  {
    icon: Heart,
    title: "Cruelty-Free",
    description: "Never tested on animals, always vegan-friendly",
  },
  {
    icon: Award,
    title: "Award Winning",
    description: "Recognized by leading beauty industry experts",
  },
];

export default function HomePage() {
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
                  New Collection Available
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight">
                Discover Your
                <span className="text-primary block">Natural Beauty</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Premium cosmetics and skincare products crafted with natural
                ingredients to enhance your radiance. Cruelty-free, vegan, and
                made with love.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/products">
                  <a className="btn-beauty flex items-center gap-2">
                    Shop Now
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Link>
                <button className="btn-beauty-outline">Learn More</button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <p className="text-3xl font-bold text-primary">10K+</p>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Premium Products</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">100%</p>
                  <p className="text-sm text-muted-foreground">Natural & Safe</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-beauty-lg">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
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
                    <p className="text-sm text-muted-foreground">Customer Rating</p>
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
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
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

      {/* Featured Products Section */}
      <section className="py-20 section-cream">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Bestsellers
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our most loved beauty essentials, handpicked for your
              skincare routine
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link href="/products">
              <a className="btn-beauty-outline inline-flex items-center gap-2">
                View All Products
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
              Join Our Beauty Community
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Get exclusive access to new products, beauty tips, and special
              offers. Sign up for our newsletter today!
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
                Subscribe
              </button>
            </form>
            <p className="text-sm mt-4 opacity-75">
              Join 10,000+ beauty lovers already subscribed
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white" id="about">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from real people who love our products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Skincare Enthusiast",
                text: "The Vitamin C serum has transformed my skin! My complexion has never looked better. Highly recommend!",
                rating: 5,
              },
              {
                name: "Emily Chen",
                role: "Makeup Artist",
                text: "As a professional makeup artist, I trust Beauty Essentials for all my clients. The quality is unmatched.",
                rating: 5,
              },
              {
                name: "Jessica Martinez",
                role: "Beauty Blogger",
                text: "Finally found a brand that's both effective and ethical. Love that everything is cruelty-free!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-pink-50 p-8 rounded-2xl hover:shadow-beauty transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
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
                      {testimonial.name.charAt(0)}
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
