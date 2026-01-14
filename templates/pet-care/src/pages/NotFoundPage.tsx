import React from 'react';
import { Link } from 'wouter';
import { Home, Search, ArrowRight } from 'lucide-react';
import { PawIcon } from '../components/PawPrintDecoration';
import { DogIcon, CatIcon } from '../components/PetIcons';

const NotFoundPage: React.FC = () => {
  return (
    <div className="relative z-10 min-h-[80vh] flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated Pets */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="animate-bounce-soft">
              <div className="bg-primary/10 p-6 rounded-3xl">
                <DogIcon className="text-primary" size={64} />
              </div>
            </div>
            <div className="relative">
              <div className="text-9xl font-bold text-primary/20">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <PawIcon className="w-24 h-24 text-primary animate-pulse" />
              </div>
            </div>
            <div className="animate-bounce-soft animation-delay-200">
              <div className="bg-secondary/10 p-6 rounded-3xl">
                <CatIcon className="text-secondary" size={64} />
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Our pets couldn't find this page. It might have wandered off to chase a squirrel!
          </p>

          {/* Paw Prints Trail */}
          <div className="flex items-center justify-center gap-2 mb-12 opacity-20">
            <PawIcon className="w-6 h-6 text-primary rotate-12" />
            <PawIcon className="w-8 h-8 text-secondary -rotate-12" />
            <PawIcon className="w-6 h-6 text-accent rotate-45" />
            <PawIcon className="w-8 h-8 text-primary -rotate-45" />
            <PawIcon className="w-6 h-6 text-secondary rotate-12" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <a className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg">
                <Home className="w-5 h-5" />
                Go Home
              </a>
            </Link>
            <Link href="/products">
              <a className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg">
                <Search className="w-5 h-5" />
                Ver Productos
              </a>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products">
                <a className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1 group">
                  Shop Products
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Link>
              <span className="text-border">•</span>
              <Link href="/services">
                <a className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1 group">
                  Pet Services
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Link>
              <span className="text-border">•</span>
              <Link href="/about">
                <a className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1 group">
                  About Us
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Link>
            </div>
          </div>

          {/* Fun Message */}
          <div className="mt-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8">
            <p className="text-lg text-foreground">
              <span className="font-bold">Pro tip:</span> While you're here, check out our{' '}
              <Link href="/products">
                <a className="text-primary font-bold hover:underline">featured products</a>
              </Link>{' '}
              for some pawsome deals! 🐾
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
