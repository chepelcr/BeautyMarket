import { Link } from "wouter";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useSubdomainContext } from "@/contexts/SubdomainContext";
import { useTheme } from "@/hooks/useContent";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const { organization } = useSubdomainContext();
  const { data: theme } = useTheme();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="text-2xl font-bold text-gradient" onClick={() => window.scrollTo(0, 0)}>
                {organization?.name || 'JMarkets Demo'}
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>
                Inicio
              </a>
            </Link>
            <Link href="/products">
              <a className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>
                Productos
              </a>
            </Link>
            <button
              onClick={toggleCart}
              className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Carrito</span>
              {cartItemCount > 0 && (
                <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 hover:bg-muted rounded-md transition-colors">
              <Search className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link href="/">
                <a
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inicio
                </a>
              </Link>
              <Link href="/products">
                <a
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Productos
                </a>
              </Link>
              <button
                onClick={() => {
                  toggleCart();
                  setMobileMenuOpen(false);
                }}
                className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2 py-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Carrito {cartItemCount > 0 ? `(${cartItemCount})` : ''}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
