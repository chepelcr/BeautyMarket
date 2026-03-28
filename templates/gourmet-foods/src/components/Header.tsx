import { Link } from 'wouter';
import { ShoppingCart, Search, Menu, ChefHat } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useTheme } from '@/hooks/useContent';
import { useSubdomainContext } from '@/contexts/SubdomainContext';

export default function Header() {
  const { items, toggleCart } = useCartStore();
  const { organization } = useSubdomainContext();
  const { data: theme } = useTheme();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 group">
              
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="w-8 h-8" />
              ) : (
                <ChefHat className="w-8 h-8 text-gourmet-red group-hover:text-gourmet-gold transition-colors" />
              )}
              <div>
                <h1 className="text-2xl font-serif font-bold text-gourmet-gradient">
                  {organization?.name || 'Gourmet Foods'}
                </h1>
                <p className="text-xs text-stone-500 font-sans">Premium Specialty Foods</p>
              </div>
            </a>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search for gourmet foods, ingredients..."
                className="w-full pl-11 pr-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gourmet-red focus:border-transparent font-sans text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-stone-600" />
            </button>

            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-stone-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gourmet-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            <button className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-stone-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 py-3 border-t border-stone-100">
          <Link href="/">
            <a className="text-sm font-medium text-stone-700 hover:text-gourmet-red transition-colors font-sans" onClick={() => window.scrollTo(0, 0)}>
              Inicio
            </a>
          </Link>
          <Link href="/products">
            <a className="text-sm font-medium text-stone-700 hover:text-gourmet-red transition-colors font-sans" onClick={() => window.scrollTo(0, 0)}>
              All Productos
            </a>
          </Link>
          <Link href="/deals">
            <a className="text-sm font-medium text-stone-700 hover:text-gourmet-red transition-colors font-sans" onClick={() => window.scrollTo(0, 0)}>
              Ofertas
            </a>
          </Link>
          <Link href="/services">
            <a className="text-sm font-medium text-stone-700 hover:text-gourmet-red transition-colors font-sans" onClick={() => window.scrollTo(0, 0)}>
              Servicios
            </a>
          </Link>
          <Link href="/programs">
            <a className="text-sm font-medium text-stone-700 hover:text-gourmet-red transition-colors font-sans" onClick={() => window.scrollTo(0, 0)}>
              Programas
            </a>
          </Link>
          <Link href="/about">
            <a className="text-sm font-medium text-stone-700 hover:text-gourmet-red transition-colors font-sans" onClick={() => window.scrollTo(0, 0)}>
              Acerca de
            </a>
          </Link>
          <a
            href={import.meta.env.VITE_LANDING_PAGE_URL || 'https://j-markets.jcampos.dev'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gourmet-red hover:text-gourmet-gold transition-colors font-sans"
          >
            Crea Tu Tienda
          </a>
        </nav>
      </div>
    </header>
  );
}
