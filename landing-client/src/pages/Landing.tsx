import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CTASecuritySection } from "@/components/sections/cta-security-section";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "wouter";
import {
  Store,
  Users,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Palette,
  CreditCard,
  Truck,
  Check,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Landing() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const isScrollingRef = useRef(false);

  // Base domain for subdomain display
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'jmarkets.jcampos.dev';

  useEffect(() => {
    document.title = t('hero.title') + " | JMarkets";
  }, [t]);

  // Handle direct URL navigation to sections
  useEffect(() => {
    // Get section from URL path (e.g., /features -> features)
    const pathParts = location.split('/').filter(Boolean);
    const targetSection = pathParts[0];

    if (targetSection && targetSection !== "home") {
      // Disable scroll spy during programmatic scroll
      isScrollingRef.current = true;

      // Wait for page to render completely
      const timer = setTimeout(() => {
        const element = document.getElementById(targetSection);
        if (element) {
          const headerOffset = 0; // No offset, scroll to section start
          const elementPosition = element.offsetTop;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });

          // Re-enable scroll spy after animation completes (give smooth scroll time)
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 3000);
        } else {
          isScrollingRef.current = false;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location]);

  // Listen for programmatic scroll events from navbar
  useEffect(() => {
    const handleProgrammaticScroll = (e: CustomEvent) => {
      isScrollingRef.current = e.detail.scrolling;
    };

    window.addEventListener('programmaticScroll', handleProgrammaticScroll as EventListener);
    return () => window.removeEventListener('programmaticScroll', handleProgrammaticScroll as EventListener);
  }, []);

  // Scroll spy - updates URL based on visible section
  useEffect(() => {
    const updateURL = () => {
      // Skip if programmatically scrolling
      if (isScrollingRef.current) return;

      // If at the very top, always set to home
      if (window.scrollY < 10) {
        if (window.location.pathname !== '/') {
          window.history.replaceState({}, '', '/');
        }
        return;
      }

      const sections = ["home", "features", "pricing"];
      const scrollPosition = window.scrollY + 64; // Nav height

      let currentSection = "home";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = window.scrollY + rect.top;

          if (scrollPosition >= elementTop) {
            currentSection = sectionId;
          }
        }
      }

      const expectedPath = currentSection === "home" ? "/" : `/${currentSection}`;
      if (window.location.pathname !== expectedPath) {
        window.history.replaceState({}, '', expectedPath);
      }
    };

    window.addEventListener('scroll', updateURL, { passive: true });
    return () => window.removeEventListener('scroll', updateURL);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="absolute inset-0">
          <svg viewBox="0 0 1440 800" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path d="M0,400 Q360,300 720,400 T1440,400 L1440,800 L0,800 Z" fill="hsl(var(--primary) / 0.05)" />
            <path d="M0,500 Q360,350 720,500 T1440,500 L1440,800 L0,800 Z" fill="hsl(var(--primary) / 0.1)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('hero.badge')}
            </Badge>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              {t('hero.title')}
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg text-white hover:opacity-90 border-0"
                  style={{ backgroundColor: 'hsl(var(--primary))' }}
                >
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/examples">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary/10">
                  {t('hero.secondary')}
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              {t('pricing.free.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-background dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          {/* First Row - 2-line text cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <FeatureCard
              icon={<Store className="h-6 w-6" />}
              title={t('features.ecommerce.title')}
              description={t('features.ecommerce.description')}
              compact
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title={t('features.analytics.title')}
              description={t('features.analytics.description')}
              useSecondary
              compact
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="CDN"
              description={t('features.analytics.description')}
              compact
            />
          </div>

          {/* Second Row - 1-line text cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title={t('features.customization.title')}
              description={`tu-tienda.${baseDomain}`}
              useSecondary
              compact
            />
            <FeatureCard
              icon={<Palette className="h-6 w-6" />}
              title={t('features.customization.title')}
              description={t('features.customization.description')}
              compact
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title={t('features.payments.title')}
              description={t('features.payments.description')}
              useSecondary
              compact
            />
            <FeatureCard
              icon={<Truck className="h-6 w-6" />}
              title={t('features.inventory.title')}
              description={t('features.inventory.description')}
              compact
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title={t('features.support.title')}
              description={t('features.support.description')}
              useSecondary
              compact
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="SSL"
              description={t('footer.links.privacy')}
              compact
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 bg-background dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Plan */}
            <Card className="relative flex flex-col bg-card dark:bg-slate-700 border-2 border-primary/30 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <CardHeader>
                <CardTitle>{t('pricing.free.name')}</CardTitle>
                <CardDescription>{t('pricing.free.description')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{t('pricing.free.price')}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 flex-grow">
                  {[0, 1, 2, 3].map((i) => (
                    <PricingFeature key={i}>{t(`pricing.free.features.${i}`)}</PricingFeature>
                  ))}
                </ul>
                <Link href="/register" className="mt-6">
                  <Button className="w-full border border-primary text-primary hover:bg-primary/20 dark:hover:bg-primary/30 bg-primary/10">
                    {t('pricing.cta')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary border-2 flex flex-col bg-card dark:bg-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge>{t('pricing.popular')}</Badge>
              </div>
              <CardHeader>
                <CardTitle>{t('pricing.pro.name')}</CardTitle>
                <CardDescription>{t('pricing.pro.description')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{t('pricing.pro.price')}</span>
                  <span className="text-muted-foreground">{t('pricing.pro.period')}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 flex-grow">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <PricingFeature key={i}>{t(`pricing.pro.features.${i}`)}</PricingFeature>
                  ))}
                </ul>
                <Button
                  disabled
                  className="w-full mt-6 btn-primary opacity-50 cursor-not-allowed"
                >
                  Proximamente
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative border-secondary border-2 flex flex-col bg-card dark:bg-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge variant="secondary">Premium</Badge>
              </div>
              <CardHeader>
                <CardTitle>{t('pricing.enterprise.name')}</CardTitle>
                <CardDescription>{t('pricing.enterprise.description')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{t('pricing.enterprise.price')}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 flex-grow">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <PricingFeature key={i}>{t(`pricing.enterprise.features.${i}`)}</PricingFeature>
                  ))}
                </ul>
                <Button
                  disabled
                  className="w-full mt-6 border-0 opacity-50 cursor-not-allowed text-gray-900"
                  style={{ backgroundColor: 'hsl(var(--secondary))' }}
                >
                  Proximamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section with Security Footer */}
      <CTASecuritySection
        titleKey="examples.cta.title"
        subtitleKey="examples.cta.subtitle"
        buttonTextKey="hero.cta"
        buttonLink="/register"
      />
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, useSecondary = false, compact = false }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  useSecondary?: boolean;
  compact?: boolean;
}) {
  const bgColor = useSecondary ? 'bg-secondary/10 dark:bg-secondary/20' : 'bg-primary/10 dark:bg-primary/20';
  const iconColor = useSecondary ? 'text-secondary' : 'text-primary';

  return (
    <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary/50 bg-card dark:bg-slate-700 border">
      <CardContent className="pt-6">
        <div className={`flex gap-4 ${compact ? 'items-center' : 'items-end'}`}>
          <div className={`p-3 ${bgColor} rounded-lg flex-shrink-0`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className={`flex-1 ${compact ? 'flex flex-col gap-1' : 'min-h-16 flex flex-col justify-between'}`}>
            <h3 className="font-semibold text-base leading-tight">{title}</h3>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pricing Feature Component
function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-secondary flex-shrink-0" />
      <span className="text-sm">{children}</span>
    </li>
  );
}
