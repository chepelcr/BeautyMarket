import { Award, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { useAboutPage, useTheme } from '../hooks/useContent';
import { parsePageSections, getSectionByType } from '../lib/pageUtils';
import { DynamicIcon } from '../components/DynamicIcon';

const iconMap: Record<string, any> = { Award, Truck, ShieldCheck, Leaf };

export default function AboutPage() {
  const { data: pageData, isLoading } = useAboutPage();
  const { data: theme } = useTheme();
  const sections = parsePageSections(pageData);
  
  const hero = getSectionByType(sections, 'hero')?.content;
  const story = getSectionByType(sections, 'story')?.content;
  const values = getSectionByType(sections, 'values')?.content;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-gourmet-red animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-serif font-bold text-stone-900 mb-6 text-center">
            {hero?.title || 'About'} <span className="text-gourmet-red">Gourmet Foods</span>
          </h1>
          <p className="text-xl text-stone-600 text-center mb-12">
            {hero?.subtitle || 'Curated selection of premium artisanal foods from around the world'}
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">{story?.title || 'Our Story'}</h2>
            <p className="text-stone-600 leading-relaxed">
              {story?.content || 'We bring you the finest gourmet foods from trusted producers worldwide. Every product is hand-selected for its exceptional quality, authentic flavor, and artisanal craftsmanship.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {(values?.items || []).map((value: any, idx: number) => {
              const Icon = iconMap[value.icon] || Award;
              return (
                <div key={idx} className="bg-stone-50 rounded-lg p-6 border border-stone-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gourmet-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-gourmet-red" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-stone-900 mb-2">
                        {value.title}
                      </h3>
                      <p className="text-stone-600">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-gourmet-red to-gourmet-gold rounded-lg p-12 text-center text-white">
            <h2 className="text-3xl font-serif font-bold mb-4">Join Our Culinary Community</h2>
            <p className="text-white/90 mb-6">
              Discover exclusive recipes, product launches, and special offers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
