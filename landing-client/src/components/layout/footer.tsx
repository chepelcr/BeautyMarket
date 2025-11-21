import { Link, useLocation } from "wouter";
import { Store } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingFooter() {
  const { t } = useLanguage();
  const [location, navigate] = useLocation();
  const currentYear = new Date().getFullYear();

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
    <footer className="bg-gray-50 dark:bg-slate-900 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => navigateToSection('home')} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                JMarkets
              </span>
            </button>
            <p className="text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.product')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => navigateToSection('features')} className="hover:text-primary text-left">{t('footer.links.features')}</button></li>
              <li><button onClick={() => navigateToSection('pricing')} className="hover:text-primary text-left">{t('footer.links.pricing')}</button></li>
              <li><Link href="/examples" className="hover:text-primary">{t('footer.links.examples')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">{t('footer.links.about')}</Link></li>
              <li><Link href="/blog" className="hover:text-primary">{t('footer.links.blog')}</Link></li>
              <li><Link href="/contact" className="hover:text-primary">{t('footer.links.contact')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary">{t('footer.links.terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">{t('footer.links.privacy')}</Link></li>
              <li><Link href="/cookies" className="hover:text-primary">{t('footer.links.cookies')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>{t('footer.copyright').replace('© 2024', `© ${currentYear}`)}</p>
        </div>
      </div>
    </footer>
  );
}
