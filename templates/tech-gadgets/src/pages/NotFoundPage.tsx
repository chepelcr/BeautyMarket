import { Link } from 'wouter';
import { AlertCircle, Home, Search, ArrowLeft, Zap } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 scanlines" />

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-tech-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-tech-electric/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="container-tech relative z-10 text-center py-16">
          <div className="max-w-2xl mx-auto">
            {/* Error Icon */}
            <div className="mb-8 relative inline-block">
              <div className="relative">
                <AlertCircle className="h-32 w-32 text-tech-cyan mx-auto tech-glow" />
                <div className="absolute inset-0 bg-tech-cyan/20 blur-2xl" />
              </div>
              {/* Floating elements around icon */}
              <div className="absolute -top-4 -right-4 animate-bounce">
                <Zap className="h-8 w-8 text-tech-electric" />
              </div>
            </div>

            {/* Error Code */}
            <div className="mb-6">
              <h1 className="text-8xl md:text-9xl font-bold mb-4 animated-gradient-text">
                404
              </h1>
              <div className="h-1 w-32 mx-auto tech-gradient rounded-full" />
            </div>

            {/* Error Message */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Oops! The page you're looking for has been disconnected from our network.
              It might have been moved, deleted, or perhaps it never existed in this dimension.
            </p>

            {/* Error Details Card */}
            <div className="card-tech max-w-md mx-auto mb-8 text-left">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-tech-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">What happened?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• The URL might be misspelled</li>
                    <li>• The page may have been removed</li>
                    <li>• The link you followed might be broken</li>
                    <li>• Our servers might be experiencing issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <button className="btn-tech-accent flex items-center space-x-2 tech-glow-hover">
                  <Home className="h-4 w-4" />
                  <span>Go Home</span>
                </button>
              </Link>
              <button
                onClick={() => window.history.back()}
                className="btn-tech-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </button>
              <Link href="/products">
                <button className="px-6 py-3 bg-card hover:bg-muted border border-border rounded-sm font-medium transition-colors flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Ver Productos</span>
                </button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-12 p-4 bg-card/50 border border-border rounded-sm">
              <p className="text-sm text-muted-foreground">
                Still having issues?{' '}
                <Link href="/help" className="text-tech-cyan hover:underline">
                  Contact our support team
                </Link>
                {' '}for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
