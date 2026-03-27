import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Leaf, Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";

interface LandingNavbarProps {
  transitionStage?: string;
}

export default function LandingNavbar({ transitionStage = '' }: LandingNavbarProps) {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nosotrosDropdownOpen, setNosotrosDropdownOpen] = useState(false);
  const [location] = useLocation();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (
    <header className={`sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border ${transitionStage}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground">
              JMarkets
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 relative">
            <Link
              href="/funcionalidades"
              className={`text-sm transition-colors hover:text-primary ${location === '/funcionalidades' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {t('nav.features')}
            </Link>
            <Link
              href="/ferias"
              className={`text-sm transition-colors hover:text-primary ${location === '/ferias' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {t('nav.fairs')}
            </Link>
            <Link
              href="/comunidad"
              className={`text-sm transition-colors hover:text-primary ${location === '/comunidad' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {t('nav.community')}
            </Link>
            <Link
              href="/ejemplos"
              className={`text-sm transition-colors hover:text-primary ${location === '/ejemplos' || location === '/examples' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {t('nav.examples')}
            </Link>

            {/* Nosotros Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => {
                if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                setNosotrosDropdownOpen(true);
              }}
              onMouseLeave={() => {
                dropdownTimeoutRef.current = setTimeout(() => {
                  setNosotrosDropdownOpen(false);
                }, 150);
              }}
            >
              <button
                onClick={() => setNosotrosDropdownOpen(!nosotrosDropdownOpen)}
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                {t('nav.nosotros')}
                <ChevronDown className={`h-4 w-4 transition-transform ${nosotrosDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-max bg-card rounded-lg shadow-lg border border-border py-2 transition-opacity pointer-events-none z-50 ${
                  nosotrosDropdownOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 invisible'
                }`}
              >
                <Link
                  href="/quienes-somos"
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50"
                  onClick={() => setNosotrosDropdownOpen(false)}
                >
                  {t('nav.about')}
                </Link>
                <Link
                  href="/contacto"
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50"
                  onClick={() => setNosotrosDropdownOpen(false)}
                >
                  {t('nav.contact')}
                </Link>
              </div>
            </div>

            <Link
              href="/blog"
              className={`text-sm transition-colors hover:text-primary ${location === '/blog' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {t('nav.blog')}
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <a href="https://admin.j-markets.jcampos.dev" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                {t('nav.login')}
              </Button>
            </a>
            <a href="https://admin.j-markets.jcampos.dev/register" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5">
                {t('nav.register')}
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                href="/funcionalidades"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.features')}
              </Link>
              <Link
                href="/ferias"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.fairs')}
              </Link>
              <Link
                href="/comunidad"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.community')}
              </Link>
              <Link
                href="/ejemplos"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.examples')}
              </Link>

              {/* Mobile Nosotros */}
              <div className="border-t border-border pt-4">
                <button
                  className="text-sm text-muted-foreground text-left font-medium mb-2 hover:text-primary"
                  onClick={() => setNosotrosDropdownOpen(!nosotrosDropdownOpen)}
                >
                  {t('nav.nosotros')}
                </button>
                {nosotrosDropdownOpen && (
                  <div className="flex flex-col gap-2 pl-4">
                    <Link
                      href="/quienes-somos"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={() => { setMobileMenuOpen(false); setNosotrosDropdownOpen(false); }}
                    >
                      {t('nav.about')}
                    </Link>
                    <Link
                      href="/contacto"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={() => { setMobileMenuOpen(false); setNosotrosDropdownOpen(false); }}
                    >
                      {t('nav.contact')}
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.blog')}
              </Link>

              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <a href="https://admin.j-markets.jcampos.dev" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                    {t('nav.login')}
                  </Button>
                </a>
                <a href="https://admin.j-markets.jcampos.dev/register" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {t('nav.register')}
                  </Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
