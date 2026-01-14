import { Link } from "wouter";
import { ShoppingBag, Heart, Menu, X, Sparkles, Store } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useTheme } from "@/hooks/useContent";
import { useSubdomainContext } from "@/contexts/SubdomainContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const { organization } = useSubdomainContext();
  const { data: theme } = useTheme();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const landingUrl = import.meta.env.VITE_LANDING_PAGE_URL || 'https://jmarkets.jcampos.dev';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="w-8 h-8" />
              ) : (
                <Sparkles className="w-8 h-8 text-primary" />
              )}
              <span className="text-2xl font-serif font-bold text-foreground">
                {organization?.name || 'Beauty Essentials'}
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
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
            <Link href="/deals">
              <a className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>
                Ofertas
              </a>
            </Link>
            <Link href="/services">
              <a className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>
                Servicios
              </a>
            </Link>
            <Link href="/programs">
              <a className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>
                Programas
              </a>
            </Link>
            <Link href="/about">
              <a className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>
                Acerca de
              </a>
            </Link>
            <a
              href={landingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Store className="w-4 h-4" />
              Crea Tu Tienda
            </a>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6 text-foreground hover:text-primary transition-colors" />
            </button>
            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-6 h-6 text-foreground hover:text-primary transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:bg-secondary rounded-full transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link href="/">
                <a
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => { toggleMenu(); window.scrollTo(0, 0); }}
                >
                  Inicio
                </a>
              </Link>
              <Link href="/products">
                <a
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => { toggleMenu(); window.scrollTo(0, 0); }}
                >
                  Productos
                </a>
              </Link>
              <Link href="/deals">
                <a
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => { toggleMenu(); window.scrollTo(0, 0); }}
                >
                  Ofertas
                </a>
              </Link>
              <Link href="/services">
                <a
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => { toggleMenu(); window.scrollTo(0, 0); }}
                >
                  Servicios
                </a>
              </Link>
              <Link href="/programs">
                <a
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => { toggleMenu(); window.scrollTo(0, 0); }}
                >
                  Programas
                </a>
              </Link>
              <Link href="/about">
                <a
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => { toggleMenu(); window.scrollTo(0, 0); }}
                >
                  Acerca de
                </a>
              </Link>
              <a
                href={landingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium mt-2"
              >
                <Store className="w-4 h-4" />
                Crea Tu Tienda
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
