import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Store, Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";

export default function LandingNavbar() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);
  const [location, navigate] = useLocation();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigateToSection = (sectionId: string) => {
    // Check if we're on the home page or a section page
    const isHomePage = location === "/" || location === "/features" || location === "/pricing";

    if (isHomePage) {
      // Signal that programmatic scrolling is starting
      window.dispatchEvent(new CustomEvent('programmaticScroll', { detail: { scrolling: true } }));

      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 0; // No offset, scroll to section start
        const elementPosition = element.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update URL
        const newPath = sectionId === "home" ? "/" : `/${sectionId}`;
        window.history.pushState({}, '', newPath);

        // Re-enable scroll spy after animation (give smooth scroll time to complete)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('programmaticScroll', { detail: { scrolling: false } }));
        }, 3000);
      } else {
        window.dispatchEvent(new CustomEvent('programmaticScroll', { detail: { scrolling: false } }));
      }
    } else {
      // Navigate to section URL - Landing component will handle scrolling
      const newPath = sectionId === "home" ? "/" : `/${sectionId}`;
      navigate(newPath);

      // If navigating to home, scroll to top after navigation
      if (sectionId === "home") {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigateToSection('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Store className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-gray-900 dark:text-white">
              JMarkets
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 relative">
            <button
              onClick={() => navigateToSection('features')}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary"
            >
              {t('nav.features')}
            </button>
            <button
              onClick={() => navigateToSection('pricing')}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary"
            >
              {t('nav.pricing')}
            </button>
            <Link href="/examples" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
              {t('nav.examples')}
            </Link>

            {/* Business Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => {
                if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                setBusinessDropdownOpen(true);
              }}
              onMouseLeave={() => {
                dropdownTimeoutRef.current = setTimeout(() => {
                  setBusinessDropdownOpen(false);
                }, 150);
              }}
            >
              <button
                onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary flex items-center gap-1"
              >
                {t('nav.business')}
                <ChevronDown className={`h-4 w-4 transition-transform ${businessDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-max bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 transition-opacity pointer-events-none z-50 ${
                  businessDropdownOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 invisible'
                }`}
              >
                <Link href="/about" className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-700">
                  {t('nav.about')}
                </Link>
                <Link href="/contact" className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-700">
                  {t('nav.contact')}
                </Link>
              </div>
            </div>

            <Link href="/blog" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
              {t('nav.blog')}
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="btn-primary">
                {t('nav.register')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              className="p-2"
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
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <button
                className="text-sm text-gray-600 dark:text-gray-300 text-left"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateToSection('features');
                }}
              >
                {t('nav.features')}
              </button>
              <button
                className="text-sm text-gray-600 dark:text-gray-300 text-left"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateToSection('pricing');
                }}
              >
                {t('nav.pricing')}
              </button>
              <Link
                href="/examples"
                className="text-sm text-gray-600 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.examples')}
              </Link>

              {/* Mobile Business Menu */}
              <div className="border-t pt-4">
                <button
                  className="text-sm text-gray-600 dark:text-gray-300 text-left font-medium mb-2"
                  onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
                >
                  {t('nav.business')}
                </button>
                {businessDropdownOpen && (
                  <div className="flex flex-col gap-2 pl-4">
                    <Link
                      href="/about"
                      className="text-sm text-gray-600 dark:text-gray-300"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setBusinessDropdownOpen(false);
                      }}
                    >
                      {t('nav.about')}
                    </Link>
                    <Link
                      href="/contact"
                      className="text-sm text-gray-600 dark:text-gray-300"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setBusinessDropdownOpen(false);
                      }}
                    >
                      {t('nav.contact')}
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/blog"
                className="text-sm text-gray-600 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.blog')}
              </Link>

              <div className="flex flex-col gap-2 pt-4 border-t">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full btn-primary">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
