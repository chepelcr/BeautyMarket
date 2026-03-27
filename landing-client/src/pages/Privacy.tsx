import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield } from "lucide-react";

export default function Privacy() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('privacy.title') + " | JMarkets";
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [t]);

  const sections = [
    { key: 'information', title: t('privacy.section.information'), content: t('privacy.information.content') },
    { key: 'usage',       title: t('privacy.section.usage'),       content: t('privacy.usage.content') },
    { key: 'storage',     title: t('privacy.section.storage'),     content: t('privacy.storage.content') },
    { key: 'cookies',     title: t('privacy.section.cookies'),     content: t('privacy.cookies.content') },
    { key: 'third',       title: t('privacy.section.third'),       content: t('privacy.third.content') },
    { key: 'rights',      title: t('privacy.section.rights'),      content: t('privacy.rights.content') },
    { key: 'protection',  title: t('privacy.section.protection'),  content: t('privacy.protection.content') },
    { key: 'contact',     title: t('privacy.section.contact'),     content: t('privacy.contact.content') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="h-3.5 w-3.5" />
              {t('privacy.badge')}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t('privacy.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              {t('privacy.subtitle')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('privacy.lastUpdated')}: {t('privacy.lastUpdatedDate')}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.key} className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-6 bg-primary/10 rounded-xl border border-primary/20">
            <h3 className="font-semibold text-lg mb-2 text-foreground">{t('privacy.notice')}</h3>
            <p className="text-sm text-muted-foreground text-justify">{t('privacy.noticeDesc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
