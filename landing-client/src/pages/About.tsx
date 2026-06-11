import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import about from "@/content/about.json";
import {
  Scale,
  Leaf,
  MapPin,
  Eye,
  Sprout,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const VALUE_ICONS = [Scale, Leaf, MapPin, Eye];

export default function About() {
  const { language: lang } = useLanguage();
  const pick = (f: { es: string; en: string }) => f[lang] ?? f.es;

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sprout className="h-3.5 w-3.5" />
            {pick(about.badge)}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            {pick(about.title)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {pick(about.subtitle)}
          </p>
        </div>
      </section>

      {/* Qué es JMarkets */}
      <section className="py-16 lg:py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                {pick(about.queEs.badge)}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {pick(about.queEs.title)}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                {pick(about.queEs.description)}
              </p>
              <ul className="flex flex-col gap-3">
                {about.queEs.points.map((point, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground text-sm">{pick(point)}</span>
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
                  <p className="text-sm text-muted-foreground">{pick(about.decorative.tagline)}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {about.decorative.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {pick(tag)}
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
            {pick(about.mission.title)}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {pick(about.mission.description)}
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16 lg:py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-10 text-center">
            {pick(about.story.title)}
          </h2>
          <div className="flex flex-col gap-6">
            {about.story.paras.map((para, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed text-lg">
                {pick(para)}
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
              {pick(about.valuesTitle)}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {about.values.map((value, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <div key={i} className="rounded-2xl p-6 bg-card border border-border hover:border-primary/20 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{pick(value.title)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pick(value.description)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-5">
            {pick(about.team.title)}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {pick(about.team.description)}
          </p>
          <a href="https://pos.j-markets.jcampos.dev/register" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gap-2">
              {pick(about.team.button)}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

    </div>
  );
}
