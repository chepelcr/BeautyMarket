import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Leaf,
  MapPin,
  Eye,
  Sprout,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  const valueItems = [
    { icon: Scale, titleKey: 'about.values.fairTrade', descKey: 'about.values.fairTrade.description' },
    { icon: Leaf, titleKey: 'about.values.conscious', descKey: 'about.values.conscious.description' },
    { icon: MapPin, titleKey: 'about.values.local', descKey: 'about.values.local.description' },
    { icon: Eye, titleKey: 'about.values.transparency', descKey: 'about.values.transparency.description' },
  ];

  const queEsPoints = [
    'about.queEs.point1',
    'about.queEs.point2',
    'about.queEs.point3',
    'about.queEs.point4',
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sprout className="h-3.5 w-3.5" />
            {t('about.badge')}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            {t('about.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Qué es JMarkets */}
      <section className="py-16 lg:py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                {t('about.queEs.badge')}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {t('about.queEs.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                {t('about.queEs.description')}
              </p>
              <ul className="flex flex-col gap-3">
                {queEsPoints.map((key) => (
                  <li key={key} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground text-sm">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Decorative visual */}
            <div className="relative">
              <div className="aspect-square max-w-sm mx-auto rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5">
                    <Sprout className="h-10 w-10 text-primary" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-foreground mb-2">JMarkets</p>
                  <p className="text-sm text-muted-foreground">Economía comunitaria</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {['Trueque', 'Ferias', 'WhatsApp', 'Local'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-5">
            {t('about.mission.title')}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('about.mission.description')}
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16 lg:py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-10 text-center">
            {t('about.story.title')}
          </h2>
          <div className="flex flex-col gap-6">
            {(['about.story.para1', 'about.story.para2', 'about.story.para3'] as const).map((key) => (
              <p key={key} className="text-muted-foreground leading-relaxed text-lg">
                {t(key)}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 lg:py-20 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              {t('about.values.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {valueItems.map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="rounded-2xl p-6 bg-card border border-border hover:border-primary/20 transition-all">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-5">
            {t('about.team.title')}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {t('about.team.description')}
          </p>
          <a href="https://admin.j-markets.jcampos.dev/register" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gap-2">
              {t('cta.community.button')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

    </div>
  );
}
