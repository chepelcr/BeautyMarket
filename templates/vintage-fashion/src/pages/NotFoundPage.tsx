import React from 'react';
import { Link } from 'wouter';
import { Home, Search, ArrowRight } from 'lucide-react';
import { VintageButton, OrnateBorder, VintageDivider } from '../components';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full">
        <OrnateBorder variant="decorative" className="bg-card text-center">
          {/* Large 404 */}
          <div className="mb-8">
            <h1 className="text-9xl font-serif font-bold text-burgundy-900/20 mb-4">404</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-burgundy-900 via-mustard-500 to-burgundy-900 mx-auto rounded-full" />
          </div>

          {/* Message */}
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-burgundy-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg font-body text-burgundy-900/80 mb-8 leading-relaxed max-w-md mx-auto">
            It seems this vintage piece has been lost to time. The page you're looking for doesn't
            exist or has been moved.
          </p>

          <VintageDivider className="my-8" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <VintageButton variant="primary" size="lg" className="w-full sm:w-auto">
                <Home size={20} className="mr-2" />
                Back to Home
              </VintageButton>
            </Link>
            <Link href="/products">
              <VintageButton variant="secondary" size="lg" className="w-full sm:w-auto">
                <Search size={20} className="mr-2" />
                Browse Collection
              </VintageButton>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t-2 border-burgundy-900/20">
            <p className="text-sm font-serif text-burgundy-900/70 mb-4 tracking-wider uppercase">
              Helpful Links
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-body">
              <Link href="/">
                <a className="text-burgundy-900 hover:text-mustard-500 transition-colors flex items-center gap-1">
                  Home
                  <ArrowRight size={14} />
                </a>
              </Link>
              <span className="text-burgundy-900/30">•</span>
              <Link href="/products">
                <a className="text-burgundy-900 hover:text-mustard-500 transition-colors flex items-center gap-1">
                  Collection
                  <ArrowRight size={14} />
                </a>
              </Link>
              <span className="text-burgundy-900/30">•</span>
              <a
                href="#"
                className="text-burgundy-900 hover:text-mustard-500 transition-colors flex items-center gap-1"
              >
                About Us
                <ArrowRight size={14} />
              </a>
              <span className="text-burgundy-900/30">•</span>
              <a
                href="#"
                className="text-burgundy-900 hover:text-mustard-500 transition-colors flex items-center gap-1"
              >
                Contact
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Decorative Quote */}
          <div className="mt-8 pt-8 border-t-2 border-burgundy-900/20">
            <p className="text-sm font-body text-burgundy-900/60 italic">
              "Not all who wander are lost, but this page certainly is."
            </p>
          </div>
        </OrnateBorder>
      </div>
    </div>
  );
}
