import React from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, Menu, X, Heart } from 'lucide-react';
import { PawIcon } from '../PawPrintDecoration';
import { useCartStore } from '@/store/cart';
import { useTheme } from '@/hooks/useContent';
import { useSubdomainContext } from '@/contexts/SubdomainContext';

const Navbar: React.FC = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { items, toggleCart } = useCartStore();
  const { organization } = useSubdomainContext();
  const { data: theme } = useTheme();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/products', label: 'Productos' },
    { path: '/services', label: 'Servicios' },
    { path: '/about', label: 'Acerca de' },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="bg-primary/10 p-2 rounded-2xl group-hover:rotate-12 transition-transform">
                
                {theme?.logoUrl ? (
                  <img src={theme.logoUrl} alt="Logo" className="w-8 h-8" />
                ) : (
                  <PawIcon className="w-8 h-8 text-primary" />
                )}
              </div>
              <span className="text-2xl font-bold text-primary">
                {organization?.name || 'PetCare'}
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive(link.path)
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-foreground'
                  }`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 rounded-xl hover:bg-primary/10 transition-colors group">
              <Heart className="w-6 h-6 text-foreground group-hover:text-primary group-hover:fill-primary transition-all" />
            </button>
            <button onClick={toggleCart} className="relative p-2 rounded-xl hover:bg-primary/10 transition-colors group">
              <ShoppingCart className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-primary/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a
                    className={`text-lg font-medium transition-colors hover:text-primary px-4 py-2 rounded-xl ${
                      isActive(link.path)
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <div className="flex items-center gap-4 px-4 pt-4 border-t border-border">
                <button className="flex-1 p-2 rounded-xl bg-primary/10 text-primary font-medium">
                  Favoritos
                </button>
                <button
                  onClick={() => {
                    toggleCart();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 p-2 rounded-xl bg-secondary/10 text-secondary font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Carrito ({cartItemCount})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
