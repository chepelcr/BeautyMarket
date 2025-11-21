import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Users, Heart, Lock } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('about.title') + " | JMarkets";
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [t]);

  const values = [
    {
      icon: Lightbulb,
      title: t('about.values.innovation'),
      description: t('about.values.innovation.description')
    },
    {
      icon: Users,
      title: t('about.values.accessibility'),
      description: t('about.values.accessibility.description')
    },
    {
      icon: Heart,
      title: t('about.values.support'),
      description: t('about.values.support.description')
    },
    {
      icon: Lock,
      title: t('about.values.security'),
      description: t('about.values.security.description')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Users className="h-3 w-3 mr-1" />
              {t('about.badge')}
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {t('about.mission.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
            {t('about.mission.description')}
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            {t('about.values.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <ValueCard key={index} value={value} />
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {t('about.ourStory')}
          </h2>

          <div className="space-y-6 text-gray-600 dark:text-gray-300">
            <p className="text-lg leading-relaxed text-justify">
              {t('about.storyPara1')}
            </p>

            <p className="text-lg leading-relaxed text-justify">
              {t('about.storyPara2')}
            </p>

            <p className="text-lg leading-relaxed text-justify">
              {t('about.storyPara3')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary dark:text-primary mb-2">
                {t('about.stats.storesNumber')}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.stats.stores')}
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary dark:text-primary mb-2">
                {t('about.stats.countriesNumber')}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.stats.countries')}
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary dark:text-primary mb-2">
                {t('about.stats.transactionsNumber')}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.stats.transactions')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('about.teamHeading')}
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
            {t('about.teamDesc')}
          </p>
        </div>
      </section>
    </div>
  );
}

// Value Card Component
function ValueCard({ value, compact = true }: {
  value: {
    icon: React.ComponentType<{ className: string }>;
    title: string;
    description: string;
  };
  compact?: boolean;
}) {
  const Icon = value.icon;

  return (
    <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary/50 bg-card dark:bg-slate-700 border">
      <CardContent className="pt-6">
        <div className={`flex gap-4 ${compact ? 'items-center' : 'items-end'}`}>
          <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg flex-shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className={compact ? 'flex-1 flex flex-col gap-1' : 'flex-1'}>
            <h3 className="font-semibold text-base leading-tight">{value.title}</h3>
            <p className="text-muted-foreground text-sm text-justify">{value.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
