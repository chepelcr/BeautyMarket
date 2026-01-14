import { Leaf, Heart, Sparkles, Users } from 'lucide-react';
import { useAboutPage, useTheme } from '../hooks/useContent';
import { parsePageSections, getSectionByType } from '../lib/pageUtils';
import { DynamicIcon } from '../components/DynamicIcon';

const iconMap: Record<string, any> = { Leaf, Heart, Sparkles, Users };

export default function AboutPage() {
  const { data: pageData, isLoading } = useAboutPage();
  const { data: theme } = useTheme();
  const sections = parsePageSections(pageData);
  
  const hero = getSectionByType(sections, 'hero')?.content;
  const story = getSectionByType(sections, 'story')?.content;
  const values = getSectionByType(sections, 'values')?.content;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-accent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-organic py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-accent animate-wiggle" />
              <span className="badge-artisan">Our Story</span>
              <Sparkles className="w-6 h-6 text-accent animate-wiggle" />
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              {hero?.title || 'About'} <span className="text-gradient-artisan">Artisan Crafts</span>
            </h1>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              {hero?.subtitle || 'Connecting talented artisans with people who value quality, authenticity, and sustainability.'}
            </p>
          </div>

          <div className="card-artisan mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 handdrawn-underline">
              {story?.title || 'Our Mission'}
            </h2>
            <p className="text-foreground/70 leading-relaxed">
              {story?.content || 'Every piece tells a story. We celebrate authentic handcrafted goods made by skilled artisans using traditional techniques and sustainable materials.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {(values?.items || []).map((value: any, idx: number) => {
              const Icon = iconMap[value.icon] || Leaf;
              return (
                <div key={idx} className="card-artisan">
                  <div className="flex items-start space-x-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                      <p className="text-foreground/70">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="section-textured rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Support Local Artisans
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Every purchase directly supports independent makers and their craft. Join our community
              of people who value quality, authenticity, and sustainability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
