import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Package,
  Share2,
  Scale,
  Leaf,
  MapPin,
  Eye,
  ArrowRight,
  Sprout,
} from "lucide-react";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({ number, icon: Icon, titleKey, descriptionKey }: {
  number: number;
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="relative flex flex-col items-center text-center px-6">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {number}
        </span>
      </div>
      <h3 className="font-serif text-lg font-bold text-foreground mb-2">{t(titleKey)}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{t(descriptionKey)}</p>
    </div>
  );
}

function ValueCard({ icon: Icon, titleKey, descriptionKey, accent }: {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  accent?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className={`group rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-md ${
      accent
        ? 'bg-accent/5 border-accent/20 hover:border-accent/40'
        : 'bg-card border-border hover:border-primary/30'
    }`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
        accent ? 'bg-accent/10' : 'bg-primary/10'
      }`}>
        <Icon className={`h-5 w-5 ${accent ? 'text-accent' : 'text-primary'}`} />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{t(titleKey)}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{t(descriptionKey)}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Landing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════════════════════════ HERO */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sprout className="h-3.5 w-3.5" />
              {t('hero.badge')}
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight mb-6">
              {t('hero.title')}
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://admin.j-markets.jcampos.dev/register"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/20"
                >
                  {t('hero.cta')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <Link href="/ejemplos">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 py-6 text-base border-border text-foreground hover:bg-muted/50"
                >
                  {t('hero.secondary')}
                </Button>
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {t('values.fairTrade.title')}
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {t('values.local.title')}
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {t('values.transparency.title')}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-14">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('howItWorks.title')}</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-4">
              {t('howItWorks.subtitle')}
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            <StepCard
              number={1}
              icon={UserPlus}
              titleKey="howItWorks.step1.title"
              descriptionKey="howItWorks.step1.description"
            />
            <StepCard
              number={2}
              icon={Package}
              titleKey="howItWorks.step2.title"
              descriptionKey="howItWorks.step2.description"
            />
            <StepCard
              number={3}
              icon={Share2}
              titleKey="howItWorks.step3.title"
              descriptionKey="howItWorks.step3.description"
            />
          </div>

          <div className="text-center mt-12">
            <Link href="/funcionalidades">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 gap-2 rounded-full">
                {t('howItWorks.learnMore')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════ VALORES */}
      <section id="valores" className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-14">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">{t('values.title')}</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-4">
              {t('values.subtitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ValueCard
              icon={Scale}
              titleKey="values.fairTrade.title"
              descriptionKey="values.fairTrade.description"
            />
            <ValueCard
              icon={Leaf}
              titleKey="values.conscious.title"
              descriptionKey="values.conscious.description"
            />
            <ValueCard
              icon={MapPin}
              titleKey="values.local.title"
              descriptionKey="values.local.description"
              accent
            />
            <ValueCard
              icon={Eye}
              titleKey="values.transparency.title"
              descriptionKey="values.transparency.description"
              accent
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════ FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('cta.community.title')}
          </h2>
          <p className="text-lg text-white/80 mb-8">
            {t('cta.community.subtitle')}
          </p>
          <a
            href="https://admin.j-markets.jcampos.dev/register"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 rounded-full px-10 py-6 text-base font-semibold shadow-lg"
            >
              {t('cta.community.button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {(['values.transparency.title', 'values.fairTrade.title', 'values.local.title'] as const).map((key) => (
              <span
                key={key}
                className="px-4 py-1.5 rounded-full bg-white/15 text-white/90 text-sm font-medium border border-white/20"
              >
                {t(key)}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
