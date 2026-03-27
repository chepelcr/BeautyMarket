import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Settings } from "lucide-react";

export default function Cookies() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('cookies.title') + " | JMarkets";
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [t]);

  const cookieTypes = [
    {
      name: t('cookies.essential'),
      description: t('cookies.essential.description'),
      examples: `Session tokens, security tokens, ${t('language.es')}`,
    },
    {
      name: t('cookies.analytics'),
      description: t('cookies.analytics.description'),
      examples: 'Google Analytics, seguimiento de interacciones',
    },
    {
      name: t('cookies.marketing'),
      description: t('cookies.marketing.description'),
      examples: 'Seguimiento de conversiones, anuncios personalizados',
    },
    {
      name: t('cookies.preferences'),
      description: t('cookies.preferences.description'),
      examples: 'Tema visual, idioma, preferencias del usuario',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Settings className="h-3.5 w-3.5" />
              {t('cookies.badge')}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t('cookies.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('cookies.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* What are cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t('cookies.what')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4 text-justify">{t('cookies.explanation')}</p>
            <p className="text-muted-foreground leading-relaxed text-justify">{t('cookies.browser')}</p>
          </div>

          {/* Types */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-8">{t('cookies.types')}</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {cookieTypes.map((cookie) => (
                <div key={cookie.name} className="rounded-2xl p-6 bg-card border border-border hover:border-primary/20 transition-all">
                  <h3 className="font-semibold text-foreground mb-2">{cookie.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 text-justify">{cookie.description}</p>
                  <p className="text-xs text-muted-foreground/70">
                    <span className="font-medium text-muted-foreground">{t('common.examples') || 'Ejemplos'}:</span> {cookie.examples}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* How to manage */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">{t('cookies.manage')}</h2>
            <div className="space-y-4">
              {[
                { title: t('cookies.usingBrowser'), desc: t('cookies.usingBrowserDesc') },
                { title: t('cookies.consent'),      desc: t('cookies.consentDesc') },
                { title: t('cookies.third'),        desc: t('cookies.thirdDesc') },
              ].map(({ title, desc }) => (
                <div key={title} className="p-5 bg-muted/40 rounded-xl border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm text-justify">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
            <h3 className="font-semibold text-lg mb-2 text-foreground">{t('cookies.important')}</h3>
            <p className="text-sm text-muted-foreground text-justify">{t('cookies.importantDesc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
