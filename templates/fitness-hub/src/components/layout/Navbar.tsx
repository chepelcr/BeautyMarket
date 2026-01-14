import { Link } from 'wouter';
import { ShoppingCart, Menu, Dumbbell, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { useTheme } from '@/hooks/useContent';
import { useSubdomainContext } from '@/contexts/SubdomainContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const { organization } = useSubdomainContext();
  const { data: theme } = useTheme();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 text-2xl font-black tracking-tight" onClick={() => window.scrollTo(0, 0)}>
              
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="w-8 h-8" />
              ) : (
                <Dumbbell className="w-8 h-8 text-red-600" />
              )}
              <span className="gradient-energy bg-clip-text text-transparent">
                {organization?.name || 'FITNESS HUB'}
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/">
              <a className="font-bold hover:text-red-600 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                HOME
              </a>
            </Link>
            <Link href="/products">
              <a className="font-bold hover:text-red-600 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                SHOP
              </a>
            </Link>
            <Link href="/programs">
              <a className="font-bold hover:text-orange-600 transition-colors flex items-center gap-1" onClick={() => window.scrollTo(0, 0)}>
                <TrendingUp className="w-4 h-4" />
                PROGRAMS
              </a>
            </Link>
            <Link href="/about">
              <a className="font-bold hover:text-red-600 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                ABOUT
              </a>
            </Link>
          </div>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-4">
              <Link href="/">
                <a className="font-bold hover:text-red-600 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                  HOME
                </a>
              </Link>
              <Link href="/products">
                <a className="font-bold hover:text-red-600 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                  SHOP
                </a>
              </Link>
              <Link href="/programs">
                <a className="font-bold hover:text-orange-600 transition-colors flex items-center gap-1" onClick={() => window.scrollTo(0, 0)}>
                  <TrendingUp className="w-4 h-4" />
                  PROGRAMS
                </a>
              </Link>
              <Link href="/about">
                <a className="font-bold hover:text-red-600 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                  ABOUT
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
