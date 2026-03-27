import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  MapPin,
  ArrowLeftRight,
  UserPlus,
  Search,
  Handshake,
  ArrowRight,
  Calendar,
} from "lucide-react";

function FairTypeCard({ icon: Icon, titleKey, descriptionKey, accent }: {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  accent?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className={`rounded-2xl p-7 border transition-all hover:-translate-y-1 hover:shadow-md ${
      accent ? 'bg-accent/5 border-accent/20 hover:border-accent/40' : 'bg-card border-border hover:border-primary/30'
    }`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
        accent ? 'bg-accent/10' : 'bg-primary/10'
      }`}>
        <Icon className={`h-6 w-6 ${accent ? 'text-accent' : 'text-primary'}`} />
      </div>
      <h3 className="font-serif text-xl font-bold text-foreground mb-3">{t(titleKey)}</h3>
      <p className="text-muted-foreground leading-relaxed">{t(descriptionKey)}</p>
    </div>
  );
}

function StepRow({ number, icon: Icon, titleKey, descriptionKey }: {
  number: number;
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex gap-5 items-start">
      <div className="flex-shrink-0 relative">
        <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {number}
        </span>
      </div>
      <div className="pt-1">
        <h3 className="font-semibold text-foreground mb-1">{t(titleKey)}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{t(descriptionKey)}</p>
      </div>
    </div>
  );
}

export default function Ferias() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-primary/5 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Calendar className="h-3.5 w-3.5" />
            {t('fairs.badge')}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            {t('fairs.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('fairs.subtitle')}
          </p>
        </div>
      </section>

      {/* Qué son las ferias */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <Calendar className="h-9 w-9 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {t('fairs.what.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t('fairs.what.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tipos de ferias */}
      <section className="py-20 lg:py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {t('fairs.types.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FairTypeCard
              icon={Monitor}
              titleKey="fairs.types.virtual.title"
              descriptionKey="fairs.types.virtual.description"
            />
            <FairTypeCard
              icon={MapPin}
              titleKey="fairs.types.physical.title"
              descriptionKey="fairs.types.physical.description"
            />
            <FairTypeCard
              icon={ArrowLeftRight}
              titleKey="fairs.types.barter.title"
              descriptionKey="fairs.types.barter.description"
              accent
            />
          </div>
        </div>
      </section>

      {/* Cómo participar */}
      <section className="py-20 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {t('fairs.howJoin.title')}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
            <StepRow
              number={1}
              icon={UserPlus}
              titleKey="fairs.howJoin.step1.title"
              descriptionKey="fairs.howJoin.step1.description"
            />
            <div className="ml-7 h-6 w-px bg-border" />
            <StepRow
              number={2}
              icon={Search}
              titleKey="fairs.howJoin.step2.title"
              descriptionKey="fairs.howJoin.step2.description"
            />
            <div className="ml-7 h-6 w-px bg-border" />
            <StepRow
              number={3}
              icon={Handshake}
              titleKey="fairs.howJoin.step3.title"
              descriptionKey="fairs.howJoin.step3.description"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">{t('fairs.cta.title')}</h2>
          <p className="text-white/80 mb-8">{t('fairs.cta.subtitle')}</p>
          <a href="https://admin.j-markets.jcampos.dev/register" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-10 py-6 text-base font-semibold">
              {t('fairs.cta.button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

    </div>
  );
}
