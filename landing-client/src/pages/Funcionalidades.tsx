import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Palette,
  MessageCircle,
  Package,
  QrCode,
  ClipboardList,
  Globe,
  ArrowRight,
  Hammer,
  UtensilsCrossed,
  Users,
} from "lucide-react";

function FeatureCard({ icon: Icon, titleKey, descriptionKey, color = 'green' }: {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  color?: 'green' | 'earth';
}) {
  const { t } = useLanguage();
  const isEarth = color === 'earth';
  return (
    <div className={`group rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-md ${
      isEarth ? 'bg-accent/5 border-accent/20 hover:border-accent/40' : 'bg-card border-border hover:border-primary/30'
    }`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        isEarth ? 'bg-accent/10' : 'bg-primary/10'
      }`}>
        <Icon className={`h-6 w-6 ${isEarth ? 'text-accent' : 'text-primary'}`} />
      </div>
      <h3 className="font-semibold text-foreground mb-2 text-lg">{t(titleKey)}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{t(descriptionKey)}</p>
    </div>
  );
}

function UseCaseCard({ icon: Icon, titleKey, descriptionKey }: {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{t(titleKey)}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{t(descriptionKey)}</p>
      </div>
    </div>
  );
}

export default function Funcionalidades() {
  const { t } = useLanguage();

  const features = [
    { icon: Palette, titleKey: 'features.templates.title', descriptionKey: 'features.templates.description', color: 'green' as const },
    { icon: MessageCircle, titleKey: 'features.whatsapp.title', descriptionKey: 'features.whatsapp.description', color: 'green' as const },
    { icon: Package, titleKey: 'features.products.title', descriptionKey: 'features.products.description', color: 'green' as const },
    { icon: QrCode, titleKey: 'features.catalog.title', descriptionKey: 'features.catalog.description', color: 'earth' as const },
    { icon: ClipboardList, titleKey: 'features.orders.title', descriptionKey: 'features.orders.description', color: 'earth' as const },
    { icon: Globe, titleKey: 'features.subdomain.title', descriptionKey: 'features.subdomain.description', color: 'earth' as const },
  ];

  const useCases = [
    { icon: Hammer, titleKey: 'features.useCase1.title', descriptionKey: 'features.useCase1.description' },
    { icon: UtensilsCrossed, titleKey: 'features.useCase2.title', descriptionKey: 'features.useCase2.description' },
    { icon: Users, titleKey: 'features.useCase3.title', descriptionKey: 'features.useCase3.description' },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/8 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            {t('features.page.badge')}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            {t('features.page.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('features.page.subtitle')}
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon, titleKey, descriptionKey, color }) => (
              <FeatureCard
                key={titleKey}
                icon={icon}
                titleKey={titleKey}
                descriptionKey={descriptionKey}
                color={color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {t('features.useCases.title')}
            </h2>
            <p className="text-muted-foreground">{t('features.useCases.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {useCases.map(({ icon, titleKey, descriptionKey }) => (
              <UseCaseCard key={titleKey} icon={icon} titleKey={titleKey} descriptionKey={descriptionKey} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">{t('features.cta.title')}</h2>
          <p className="text-white/80 mb-8">{t('features.cta.subtitle')}</p>
          <a href="https://admin.j-markets.jcampos.dev/register" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-10 py-6 text-base font-semibold">
              {t('features.cta.button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

    </div>
  );
}
