import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export default function Privacy() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('privacy.title') + " | JMarkets";
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [t]);

  const sections = [
    {
      key: 'information',
      title: t('privacy.section.information'),
      content: t('privacy.information.content')
    },
    {
      key: 'usage',
      title: t('privacy.section.usage'),
      content: t('privacy.usage.content')
    },
    {
      key: 'storage',
      title: t('privacy.section.storage'),
      content: t('privacy.storage.content')
    },
    {
      key: 'cookies',
      title: t('privacy.section.cookies'),
      content: t('privacy.cookies.content')
    },
    {
      key: 'third',
      title: t('privacy.section.third'),
      content: t('privacy.third.content')
    },
    {
      key: 'rights',
      title: t('privacy.section.rights'),
      content: t('privacy.rights.content')
    },
    {
      key: 'protection',
      title: t('privacy.section.protection'),
      content: t('privacy.protection.content')
    },
    {
      key: 'contact',
      title: t('privacy.section.contact'),
      content: t('privacy.contact.content')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Shield className="h-3 w-3 mr-1" />
              {t('privacy.badge')}
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('privacy.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              {t('privacy.subtitle')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('privacy.lastUpdated')}: {t('privacy.lastUpdatedDate')}
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Privacy Notice */}
          <div className="mt-16 p-6 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              {t('privacy.notice')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-justify">
              {t('privacy.noticeDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
