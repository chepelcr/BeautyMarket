import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CTASecuritySection } from "@/components/sections/cta-security-section";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Store,
  Smartphone,
  Shirt,
  Paintbrush,
  UtensilsCrossed,
  Dumbbell,
  PawPrint,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

interface ExampleStore {
  id: string;
  displayName: string;
  description: string;
  category: string;
  url: string;
  icon: React.ReactNode;
  featured: boolean;
}

// Icon mapping based on category
const getCategoryIcon = (category: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    demo: <Store className="h-6 w-6" />,
    electronics: <Smartphone className="h-6 w-6" />,
    fashion: <Shirt className="h-6 w-6" />,
    crafts: <Paintbrush className="h-6 w-6" />,
    food: <UtensilsCrossed className="h-6 w-6" />,
    sports: <Dumbbell className="h-6 w-6" />,
    pets: <PawPrint className="h-6 w-6" />,
    beauty: <Sparkles className="h-6 w-6" />,
  };
  return iconMap[category] || <Store className="h-6 w-6" />;
};

// Featured templates (by name)
const featuredTemplateNames = ['jmarkets-demo', 'tech-gadgets', 'vintage-fashion'];

export default function Examples() {
  const { t } = useLanguage();
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    document.title = t('examples.title') + " | JMarkets";
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [t]);

  // Fetch templates from API
  const { data: templates, isLoading, isError, error } = useQuery<Template[]>({
    queryKey: [`${API_BASE_URL}/api/templates?activeOnly=true`],
  });

  // Transform templates to example stores
  const exampleStores: ExampleStore[] = (templates || []).map((template) => ({
    id: template.id,
    displayName: template.displayName,
    description: template.description,
    category: template.category,
    url: `https://${template.name}-example.j-markets.jcampos.dev`,
    icon: getCategoryIcon(template.category),
    featured: featuredTemplateNames.includes(template.name),
  }));

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
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Loading templates...
              </span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col justify-center items-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Failed to Load Templates
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {error instanceof Error ? error.message : 'An error occurred while loading templates. Please try again later.'}
              </p>
            </div>
          )}

          {!isLoading && !isError && exampleStores.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exampleStores.map((store) => (
                <ExampleCard key={store.id} store={store} />
              ))}
            </div>
          )}

          {!isLoading && !isError && exampleStores.length === 0 && (
            <div className="flex flex-col justify-center items-center py-20 text-center">
              <Store className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Templates Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                There are currently no example stores to display.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section with Security Footer */}
      <CTASecuritySection
        titleKey="examples.cta.title"
        subtitleKey="examples.cta.subtitle"
        buttonTextKey="examples.cta.button"
        onClick={() => window.open('https://admin.j-markets.jcampos.dev/register', '_blank', 'noopener,noreferrer')}
        buttonIcon={null}
        variant="light"
      />
    </div>
  );
}

// Example Card Component
function ExampleCard({ store }: {
  store: ExampleStore;
}) {
  const { t } = useLanguage();

  const handleVisit = () => {
    window.open(store.url, '_blank', 'noopener,noreferrer');
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
          <Badge variant="outline" className="capitalize">{store.category}</Badge>
        </div>
        <CardTitle className="mt-4">{store.displayName}</CardTitle>
        <CardDescription className="line-clamp-3 text-justify">
          {store.description}
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
