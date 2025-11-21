import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      examples: 'Session tokens, security tokens, ' + t('language.es')
    },
    {
      name: t('cookies.analytics'),
      description: t('cookies.analytics.description'),
      examples: 'Google Analytics, user interaction tracking'
    },
    {
      name: t('cookies.marketing'),
      description: t('cookies.marketing.description'),
      examples: 'Conversion tracking, personalized advertisements'
    },
    {
      name: t('cookies.preferences'),
      description: t('cookies.preferences.description'),
      examples: 'Theme preferences, language settings, user choices'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Settings className="h-3 w-3 mr-1" />
              {t('cookies.badge')}
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('cookies.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('cookies.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* What are Cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('cookies.what')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-justify">
              {t('cookies.explanation')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
              {t('cookies.browser')}
            </p>
          </div>

          {/* Types of Cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              {t('cookies.types')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {cookieTypes.map((cookie, index) => (
                <Card key={index} className="bg-white dark:bg-slate-800 flex flex-col">
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-lg">{cookie.name}</CardTitle>
                    <CardDescription className="text-justify">{cookie.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-justify">
                      <strong>Examples:</strong> {cookie.examples}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How to Manage Cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {t('cookies.manage')}
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('cookies.usingBrowser')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-justify">
                  {t('cookies.usingBrowserDesc')}
                </p>
              </div>

              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('cookies.consent')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-justify">
                  {t('cookies.consentDesc')}
                </p>
              </div>

              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('cookies.third')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-justify">
                  {t('cookies.thirdDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="p-6 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              {t('cookies.important')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-justify">
              {t('cookies.importantDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
