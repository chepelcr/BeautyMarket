import React, { useState } from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { VintageButton } from '../VintageButton';
import { useCartStore } from '@/store/cart';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-card border-b-2 border-burgundy-900/20 shadow-vintage backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <a className="flex flex-col hover:opacity-80 transition-opacity" onClick={() => window.scrollTo(0, 0)}>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-burgundy-900">
                Vintage Fashion Co.
              </h1>
              <p className="text-xs font-body text-burgundy-900/70 italic hidden sm:block">
                Timeless Elegance Since 1952
              </p>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className="font-serif text-burgundy-900 hover:text-mustard-500 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Inicio
              </a>
            </Link>
            <Link href="/products">
              <a className="font-serif text-burgundy-900 hover:text-mustard-500 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Collection
              </a>
            </Link>
            <Link href="/products">
              <a className="font-serif text-burgundy-900 hover:text-mustard-500 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                New Arrivals
              </a>
            </Link>
            <Link href="/products">
              <a className="font-serif text-burgundy-900 hover:text-mustard-500 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Sale
              </a>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button className="p-2 text-burgundy-900 hover:text-mustard-500 transition-colors hidden md:block">
              <Search size={20} />
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-burgundy-900 hover:text-mustard-500 transition-colors"
            >
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-burgundy-900 text-cream-50 text-xs font-serif font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => { toggleMenu(); window.scrollTo(0, 0); }}
              className="md:hidden p-2 text-burgundy-900 hover:text-mustard-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t-2 border-burgundy-900/20">
            <div className="flex flex-col space-y-4">
              <Link href="/">
                <a
                  className="font-serif text-burgundy-900 hover:text-mustard-500 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </a>
              </Link>
              <Link href="/products">
                <a
                  className="font-serif text-burgundy-900 hover:text-mustard-500 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Collection
                </a>
              </Link>
              <Link href="/products">
                <a
                  className="font-serif text-burgundy-900 hover:text-mustard-500 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  New Arrivals
                </a>
              </Link>
              <Link href="/products">
                <a
                  className="font-serif text-burgundy-900 hover:text-mustard-500 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sale
                </a>
              </Link>
              <div className="pt-4 border-t border-burgundy-900/20">
                <button className="w-full flex items-center justify-center gap-2 text-burgundy-900 hover:text-mustard-500 transition-colors py-2">
                  <Search size={18} />
                  <span className="font-serif">Search</span>
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
