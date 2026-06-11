import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import community from "@/content/community.json";
import {
  Scale,
  MapPin,
  ShoppingBag,
  Eye,
  Users,
  ArrowLeftRight,
  ArrowRight,
  Star,
  Heart,
} from "lucide-react";

function ValuePill({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all group">
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, name, business }: {
  quote: string;
  name: string;
  business: string;
}) {
  return (
    <div className="rounded-2xl p-7 bg-card border border-border hover:border-primary/20 transition-all flex flex-col gap-4">
      {/* Stars */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-primary fill-primary" />
        ))}
      </div>
      {/* Quote */}
      <p className="text-muted-foreground leading-relaxed italic flex-1">{quote}</p>
      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">{name[0]}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{business}</p>
        </div>
      </div>
    </div>
  );
}

const VALUE_ICONS = [Scale, MapPin, ShoppingBag, Eye, Users, ArrowLeftRight];

export default function Comunidad() {
  const { language: lang } = useLanguage();
  const pick = (f: { es: string; en: string }) => f[lang] ?? f.es;

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
        <div className="absolute top-16 right-8 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Heart className="h-3.5 w-3.5" />
            {pick(community.badge)}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            {pick(community.title)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {pick(community.subtitle)}
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {pick(community.valuesTitle)}
            </h2>
            <p className="text-muted-foreground">{pick(community.valuesSubtitle)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {community.values.map((value, i) => (
              <ValuePill key={i} icon={VALUE_ICONS[i]} title={pick(value.title)} description={pick(value.description)} />
            ))}
          </div>
        </div>
      </section>

      {/* Trueque */}
      <section className="py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                <ArrowLeftRight className="h-7 w-7 text-accent" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {pick(community.barter.title)}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                {pick(community.barter.description)}
              </p>
              <div className="flex flex-col gap-3">
                {community.barter.how.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-foreground font-medium">{pick(step)}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Decorative card */}
            <div className="rounded-3xl bg-accent/5 border border-accent/20 p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-sm font-bold">{community.barter.exampleCards[0].avatar}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{pick(community.barter.exampleCards[0].offers)}</p>
                  <p className="text-xs text-muted-foreground">{pick(community.barter.exampleCards[0].seeks)}</p>
                </div>
                <ArrowLeftRight className="h-4 w-4 text-accent" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent text-sm font-bold">{community.barter.exampleCards[1].avatar}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{pick(community.barter.exampleCards[1].offers)}</p>
                  <p className="text-xs text-muted-foreground">{pick(community.barter.exampleCards[1].seeks)}</p>
                </div>
                <ArrowLeftRight className="h-4 w-4 text-primary" />
              </div>
              <div className="text-center py-2">
                <span className="text-xs text-muted-foreground italic">{pick(community.barter.perfectExchange)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redes de apoyo mutuo */}
      <section className="py-16 bg-muted/20 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <Users className="h-9 w-9 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {pick(community.mutual.title)}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {pick(community.mutual.description)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {pick(community.storiesTitle)}
            </h2>
            <p className="text-muted-foreground">{pick(community.storiesSubtitle)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {community.stories.map((story, i) => (
              <TestimonialCard
                key={i}
                quote={pick(story.quote)}
                name={pick(story.name)}
                business={pick(story.business)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">{pick(community.cta.title)}</h2>
          <p className="text-white/80 mb-8">{pick(community.cta.subtitle)}</p>
          <a href="https://admin.j-markets.jcampos.dev/register" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-10 py-6 text-base font-semibold">
              {pick(community.cta.button)}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

    </div>
  );
}
