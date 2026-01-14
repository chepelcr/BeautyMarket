import { Zap, Target, TrendingUp, Award } from 'lucide-react';
import { useAboutPage, useTheme } from '../hooks/useContent';
import { parsePageSections, getSectionByType } from '../lib/pageUtils';
import { DynamicIcon } from '../components/DynamicIcon';

const iconMap: Record<string, any> = { Zap, Target, TrendingUp, Award };

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
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-red-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-black text-gray-900 mb-6 text-center">
            {hero?.title?.toUpperCase() || 'ABOUT'} <span className="gradient-energy bg-clip-text text-transparent">FITNESS HUB</span>
          </h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            {hero?.subtitle || 'Premium equipment. Expert guidance. Unstoppable results.'}
          </p>

          <div className="card-fitness p-8 mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">{story?.title?.toUpperCase() || 'OUR MISSION'}</h2>
            <p className="text-gray-600 leading-relaxed">
              {story?.content || 'We provide everything you need to reach your peak performance. From professional-grade equipment to expert training programs, Fitness Hub is your partner in transformation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {(values?.items || []).map((value: any, idx: number) => {
              const Icon = iconMap[value.icon] || Zap;
              return (
                <div key={idx} className="card-fitness p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">{value.title.toUpperCase()}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-900 rounded-lg p-12 text-center text-white">
            <h2 className="text-4xl font-black mb-4">
              READY TO <span className="gradient-energy bg-clip-text text-transparent">DOMINATE?</span>
            </h2>
            <p className="text-gray-300 text-lg">
              Join our community of champions and start your transformation today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
