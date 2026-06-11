import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import privacy from "@/content/privacy.json";
import { Shield } from "lucide-react";

export default function Privacy() {
  const { language: lang } = useLanguage();
  const pick = (f: { es: string; en: string }) => f[lang] ?? f.es;

  useEffect(() => {
    document.title = pick(privacy.title) + pick(privacy.docTitleSuffix);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [lang]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="h-3.5 w-3.5" />
              {pick(privacy.badge)}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {pick(privacy.title)}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              {pick(privacy.subtitle)}
            </p>
            <p className="text-sm text-muted-foreground">
              {pick(privacy.lastUpdated)}: {pick(privacy.lastUpdatedDate)}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {privacy.sections.map((section, i) => (
              <div key={i} className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">{pick(section.title)}</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">{pick(section.content)}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-6 bg-primary/10 rounded-xl border border-primary/20">
            <h3 className="font-semibold text-lg mb-2 text-foreground">{pick(privacy.notice)}</h3>
            <p className="text-sm text-muted-foreground text-justify">{pick(privacy.noticeDesc)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
