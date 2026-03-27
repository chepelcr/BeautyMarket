import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText } from "lucide-react";

export default function Terms() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('terms.title') + " | JMarkets";
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [t]);

  const sections = [
    { key: 'acceptance',  title: t('terms.section.acceptance'),  content: t('terms.acceptance.content') },
    { key: 'accounts',    title: t('terms.section.accounts'),    content: t('terms.accounts.content') },
    { key: 'services',    title: t('terms.section.services'),    content: t('terms.services.content') },
    { key: 'payment',     title: t('terms.section.payment'),     content: t('terms.payment.content') },
    { key: 'intellectual',title: t('terms.section.intellectual'),content: t('terms.intellectual.content') },
    { key: 'liability',   title: t('terms.section.liability'),   content: t('terms.liability.content') },
    { key: 'changes',     title: t('terms.section.changes'),     content: t('terms.changes.content') },
    { key: 'contact',     title: t('terms.section.contact'),     content: t('terms.contact.content') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <FileText className="h-3.5 w-3.5" />
              {t('terms.badge')}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t('terms.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              {t('terms.subtitle')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('terms.lastUpdated')}: {t('terms.lastUpdatedDate')}
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
            <h3 className="font-semibold text-lg mb-2 text-foreground">{t('terms.importantNotice')}</h3>
            <p className="text-sm text-muted-foreground text-justify">{t('terms.acceptanceNotice')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
