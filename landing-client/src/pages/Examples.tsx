import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CTASecuritySection } from "@/components/sections/cta-security-section";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ExternalLink,
  Store,
  Sparkles,
  Leaf,
  Crown,
  Heart,
  Scissors,
  Star
} from "lucide-react";

export default function Examples() {
  const { t } = useLanguage();

  // Demo URL from environment variable, defaults to localhost for development
  const demoUrl = import.meta.env.VITE_DEMO_URL || 'http://localhost:5000';

  useEffect(() => {
    document.title = t('examples.title') + " | JMarkets";
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [t]);

  // Example store data with translation keys
  const exampleStores = [
    {
      id: "basic-example",
      titleKey: "examples.stores.demo.title",
      descriptionKey: "examples.stores.demo.description",
      categoryKey: "examples.stores.demo.category",
      url: demoUrl,
      icon: <Store className="h-6 w-6" />,
      featured: true
    },
    {
      id: "bella-natural",
      titleKey: "examples.stores.bellaNatural.title",
      descriptionKey: "examples.stores.bellaNatural.description",
      categoryKey: "examples.stores.bellaNatural.category",
      url: "https://bella-natural.jmarkets.jcampos.dev",
      icon: <Leaf className="h-6 w-6" />,
      featured: false
    },
    {
      id: "glam-studio",
      titleKey: "examples.stores.glamStudio.title",
      descriptionKey: "examples.stores.glamStudio.description",
      categoryKey: "examples.stores.glamStudio.category",
      url: "https://glam-studio.jmarkets.jcampos.dev",
      icon: <Sparkles className="h-6 w-6" />,
      featured: false
    },
    {
      id: "royal-hair",
      titleKey: "examples.stores.royalHair.title",
      descriptionKey: "examples.stores.royalHair.description",
      categoryKey: "examples.stores.royalHair.category",
      url: "https://royal-hair.jmarkets.jcampos.dev",
      icon: <Crown className="h-6 w-6" />,
      featured: true
    },
    {
      id: "skin-love",
      titleKey: "examples.stores.skinLove.title",
      descriptionKey: "examples.stores.skinLove.description",
      categoryKey: "examples.stores.skinLove.category",
      url: "https://skin-love.jmarkets.jcampos.dev",
      icon: <Heart className="h-6 w-6" />,
      featured: false
    },
    {
      id: "pro-nails",
      titleKey: "examples.stores.proNails.title",
      descriptionKey: "examples.stores.proNails.description",
      categoryKey: "examples.stores.proNails.category",
      url: "https://pro-nails.jmarkets.jcampos.dev",
      icon: <Star className="h-6 w-6" />,
      featured: false
    },
    {
      id: "beauty-salon",
      titleKey: "examples.stores.beautySalon.title",
      descriptionKey: "examples.stores.beautySalon.description",
      categoryKey: "examples.stores.beautySalon.category",
      url: "https://beauty-salon.jmarkets.jcampos.dev",
      icon: <Scissors className="h-6 w-6" />,
      featured: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Store className="h-3 w-3 mr-1" />
              {t('examples.badge')}
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('examples.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('examples.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exampleStores.map((store) => (
              <ExampleCard key={store.id} store={store} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Security Footer */}
      <CTASecuritySection
        titleKey="examples.cta.title"
        subtitleKey="examples.cta.subtitle"
        buttonTextKey="examples.cta.button"
        onClick={() => window.location.href = '/organizations/new'}
        buttonIcon={null}
        variant="light"
      />
    </div>
  );
}

// Example Card Component
function ExampleCard({ store, t }: {
  store: {
    id: string;
    titleKey: string;
    descriptionKey: string;
    categoryKey: string;
    url: string;
    icon: React.ReactNode;
    featured: boolean;
    isInternal?: boolean;
  };
  t: (key: string) => string;
}) {
  const handleVisit = () => {
    if (store.isInternal) {
      window.open(store.url, '_blank');
    } else {
      window.open(store.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className={`relative transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary/50 bg-card dark:bg-slate-700 flex flex-col border ${store.featured ? 'ring-2 ring-primary' : ''}`}>
      {store.featured && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge variant="secondary">{t('examples.featured')}</Badge>
        </div>
      )}
      <CardHeader className="flex-grow">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg w-fit">
            <div className="text-primary">{store.icon}</div>
          </div>
          <Badge variant="outline">{t(store.categoryKey)}</Badge>
        </div>
        <CardTitle className="mt-4">{t(store.titleKey)}</CardTitle>
        <CardDescription className="line-clamp-3 text-justify">
          {t(store.descriptionKey)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleVisit}
          className="w-full bg-gray-700 text-white hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 border-0"
        >
          {t('examples.viewStore')}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
