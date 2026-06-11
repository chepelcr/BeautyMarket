import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import cookies from "@/content/cookies.json";
import { Settings } from "lucide-react";

export default function Cookies() {
  const { language: lang } = useLanguage();
  const pick = (f: { es: string; en: string }) => f[lang] ?? f.es;

  useEffect(() => {
    document.title = pick(cookies.title) + pick(cookies.docTitleSuffix);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [lang]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Settings className="h-3.5 w-3.5" />
              {pick(cookies.badge)}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {pick(cookies.title)}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {pick(cookies.subtitle)}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* What are cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{pick(cookies.what)}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4 text-justify">{pick(cookies.explanation)}</p>
            <p className="text-muted-foreground leading-relaxed text-justify">{pick(cookies.browser)}</p>
          </div>

          {/* Types */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-8">{pick(cookies.typesTitle)}</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {cookies.types.map((cookie, i) => (
                <div key={i} className="rounded-2xl p-6 bg-card border border-border hover:border-primary/20 transition-all">
                  <h3 className="font-semibold text-foreground mb-2">{pick(cookie.name)}</h3>
                  <p className="text-sm text-muted-foreground mb-3 text-justify">{pick(cookie.description)}</p>
                  <p className="text-xs text-muted-foreground/70">
                    <span className="font-medium text-muted-foreground">{pick(cookies.examplesLabel)}:</span> {pick(cookie.examples)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* How to manage */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">{pick(cookies.manage)}</h2>
            <div className="space-y-4">
              {cookies.manageSections.map((section, i) => (
                <div key={i} className="p-5 bg-muted/40 rounded-xl border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{pick(section.title)}</h3>
                  <p className="text-muted-foreground text-sm text-justify">{pick(section.desc)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
            <h3 className="font-semibold text-lg mb-2 text-foreground">{pick(cookies.important)}</h3>
            <p className="text-sm text-muted-foreground text-justify">{pick(cookies.importantDesc)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
