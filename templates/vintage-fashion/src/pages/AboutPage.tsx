import { Award, ShieldCheck, Sparkles, Heart } from 'lucide-react';
import { VintageCard, VintageCardContent, OrnateBorder, VintageDivider } from '../components';
import { useAboutPage, useTheme } from '../hooks/useContent';
import { parsePageSections, getSectionByType } from '../lib/pageUtils';
import { DynamicIcon } from '../components/DynamicIcon';

const iconMap: Record<string, any> = { Award, ShieldCheck, Sparkles, Heart };

export function AboutPage() {
  const { data: pageData, isLoading } = useAboutPage();
  const { data: theme } = useTheme();
  const sections = parsePageSections(pageData);
  
  const hero = getSectionByType(sections, 'hero')?.content;
  const story = getSectionByType(sections, 'story')?.content;
  const values = getSectionByType(sections, 'values')?.content;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-mustard-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-burgundy-900 mb-6">
            {hero?.title || 'Our Story'}
          </h1>
          <p className="text-xl font-body text-burgundy-900/80 max-w-3xl mx-auto">
            {hero?.subtitle || 'Celebrating timeless elegance and authentic vintage fashion since our founding.'}
          </p>
        </div>

        <OrnateBorder variant="decorative" className="bg-card mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-burgundy-900 mb-6 text-center">
              {story?.title || 'A Passion for Vintage'}
            </h2>
            <p className="text-lg font-body text-burgundy-900/80 leading-relaxed">
              {story?.content || 'Every piece in our collection is carefully selected for its authenticity, quality, and timeless appeal.'}
            </p>
          </div>
        </OrnateBorder>

        <VintageDivider text={values?.title || 'Our Values'} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {(values?.items || []).map((value: any, idx: number) => {
            const Icon = iconMap[value.icon] || Award;
            return (
              <VintageCard key={idx}>
                <VintageCardContent>
                  <div className="flex items-start space-x-4">
                    <div className="p-4 bg-cream-100 rounded-full">
                      <Icon className="w-8 h-8 text-mustard-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-burgundy-900 mb-2">
                        {value.title}
                      </h3>
                      <p className="font-body text-burgundy-900/70 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </VintageCardContent>
              </VintageCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
