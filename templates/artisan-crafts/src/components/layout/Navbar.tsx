import { Link } from 'wouter';
import { ShoppingBag, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container-organic py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-gradient-artisan">
                Artisan Crafts
              </h1>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className="handdrawn-underline text-foreground hover:text-primary transition-colors font-sans font-semibold">
                Home
              </a>
            </Link>
            <Link href="/products">
              <a className="handdrawn-underline text-foreground hover:text-primary transition-colors font-sans font-semibold">
                Shop
              </a>
            </Link>
            <a href="#about" className="handdrawn-underline text-foreground hover:text-primary transition-colors font-sans font-semibold">
              About
            </a>
            <a href="#artisans" className="handdrawn-underline text-foreground hover:text-primary transition-colors font-sans font-semibold">
              Artisans
            </a>
          </div>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleCart}
              className="btn-artisan-outline px-4 py-2 relative"
            >
              <ShoppingBag className="w-4 h-4 inline mr-2" />
              <span className="hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-border mt-4">
            <div className="flex flex-col space-y-3">
              <Link href="/">
                <a className="text-foreground hover:text-primary transition-colors font-sans font-semibold">
                  Home
                </a>
              </Link>
              <Link href="/products">
                <a className="text-foreground hover:text-primary transition-colors font-sans font-semibold">
                  Shop
                </a>
              </Link>
              <a href="#about" className="text-foreground hover:text-primary transition-colors font-sans font-semibold">
                About
              </a>
              <a href="#artisans" className="text-foreground hover:text-primary transition-colors font-sans font-semibold">
                Artisans
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
