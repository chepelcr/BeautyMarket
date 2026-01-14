import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Home, ArrowRight, Sparkles, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Number */}
            <div className="relative mb-8">
              <h1 className="text-9xl md:text-[12rem] font-serif font-bold text-primary/10 leading-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-24 h-24 md:w-32 md:h-32 text-primary animate-pulse" />
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
              We couldn't find the beauty product you're looking for. It might
              have been discontinued or the link may be broken.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/">
                <a className="btn-beauty inline-flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Back to Home
                </a>
              </Link>
              <Link href="/products">
                <a className="btn-beauty-outline inline-flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Ver Productos
                </a>
              </Link>
            </div>

            {/* Decorative Elements */}
            <div className="relative">
              <div className="beauty-divider mb-8"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Suggestions */}
            <div className="mt-12">
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                Explore Our Collections
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                <Link href="/products?category=skincare">
                  <a className="p-6 bg-white border border-border rounded-xl hover:border-primary hover:shadow-beauty transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-serif font-bold text-foreground mb-1">
                      Skincare
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Serums, Creams & More
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop Now
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </a>
                </Link>

                <Link href="/products?category=makeup">
                  <a className="p-6 bg-white border border-border rounded-xl hover:border-primary hover:shadow-beauty transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-serif font-bold text-foreground mb-1">
                      Makeup
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Lipsticks, Blush & More
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop Now
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </a>
                </Link>

                <Link href="/products?category=fragrance">
                  <a className="p-6 bg-white border border-border rounded-xl hover:border-primary hover:shadow-beauty transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-serif font-bold text-foreground mb-1">
                      Fragrance
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Perfumes & Body Mists
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop Now
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </a>
                </Link>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-12 p-6 bg-white border border-border rounded-xl max-w-md mx-auto">
              <p className="text-muted-foreground text-sm">
                Need help finding something specific?{" "}
                <a
                  href="#contact"
                  className="text-primary font-semibold hover:underline"
                >
                  Contact our beauty experts
                </a>{" "}
                for personalized product recommendations.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
