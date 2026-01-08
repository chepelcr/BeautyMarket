import { Link } from 'wouter';
import { Zap, ShoppingCart, Menu, X, Search, User } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="backdrop-tech border-b border-border sticky top-0 z-50">
      <div className="container-tech py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="relative">
                <Zap className="h-8 w-8 text-tech-cyan group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
                <div className="absolute inset-0 bg-tech-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h1 className="text-2xl font-bold animated-gradient-text">TechGadgets</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/products" className="hover:text-tech-cyan transition-colors font-medium">
              Products
            </Link>
            <Link href="/categories" className="hover:text-tech-cyan transition-colors font-medium">
              Categories
            </Link>
            <Link href="/deals" className="hover:text-tech-cyan transition-colors font-medium">
              Deals
            </Link>
            <Link href="/about" className="hover:text-tech-cyan transition-colors font-medium">
              About
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-muted rounded-sm transition-colors relative group"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
              <div className="absolute inset-0 bg-tech-cyan/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </button>

            {/* User Account */}
            <Link href="/account">
              <button className="p-2 hover:bg-muted rounded-sm transition-colors relative group hidden sm:block">
                <User className="h-5 w-5" />
                <div className="absolute inset-0 bg-tech-cyan/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              </button>
            </Link>

            {/* Shopping Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-muted rounded-sm transition-colors group"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center pulse-glow">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
              <div className="absolute inset-0 bg-tech-cyan/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </button>

            {/* CTA Button - Desktop */}
            <button className="btn-tech-accent hidden md:block">
              Shop Now
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-sm transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {searchOpen && (
          <div className="mt-4 animate-in slide-in-from-top-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for gadgets, brands, or categories..."
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-tech-cyan text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-in slide-in-from-top-4">
            <div className="flex flex-col space-y-4">
              <Link href="/products">
                <div className="px-4 py-2 hover:bg-muted rounded-sm transition-colors cursor-pointer">
                  Products
                </div>
              </Link>
              <Link href="/categories">
                <div className="px-4 py-2 hover:bg-muted rounded-sm transition-colors cursor-pointer">
                  Categories
                </div>
              </Link>
              <Link href="/deals">
                <div className="px-4 py-2 hover:bg-muted rounded-sm transition-colors cursor-pointer">
                  Deals
                </div>
              </Link>
              <Link href="/about">
                <div className="px-4 py-2 hover:bg-muted rounded-sm transition-colors cursor-pointer">
                  About
                </div>
              </Link>
              <Link href="/account">
                <div className="px-4 py-2 hover:bg-muted rounded-sm transition-colors cursor-pointer sm:hidden">
                  Account
                </div>
              </Link>
              <button className="btn-tech-accent w-full md:hidden">
                Shop Now
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
