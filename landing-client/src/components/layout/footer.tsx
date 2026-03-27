import { Link } from "wouter";
import { Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingFooter() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/40 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                <Leaf className="h-4 w-4 text-primary" />
              </div>
              <span className="font-serif text-xl font-bold text-foreground">
                JMarkets
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">{t('footer.product')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/funcionalidades" className="hover:text-primary transition-colors">{t('footer.links.features')}</Link></li>
              <li><Link href="/ferias" className="hover:text-primary transition-colors">{t('footer.links.fairs')}</Link></li>
              <li><Link href="/comunidad" className="hover:text-primary transition-colors">{t('footer.links.community')}</Link></li>
              <li><Link href="/ejemplos" className="hover:text-primary transition-colors">{t('footer.links.examples')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/quienes-somos" className="hover:text-primary transition-colors">{t('footer.links.about')}</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">{t('footer.links.blog')}</Link></li>
              <li><Link href="/contacto" className="hover:text-primary transition-colors">{t('footer.links.contact')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terminos" className="hover:text-primary transition-colors">{t('footer.links.terms')}</Link></li>
              <li><Link href="/privacidad" className="hover:text-primary transition-colors">{t('footer.links.privacy')}</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors">{t('footer.links.cookies')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{t('footer.copyright').replace('© 2026', `© ${currentYear}`)}</p>
        </div>
      </div>
    </footer>
  );
}
