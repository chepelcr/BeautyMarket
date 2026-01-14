import { HeartPawIcon, BoneIcon, PetHouseIcon } from '../components/PetIcons';
import { PawIcon } from '../components/PawPrintDecoration';
import { useAboutPage, useTheme } from '../hooks/useContent';
import { parsePageSections, getSectionByType } from '../lib/pageUtils';
import { DynamicIcon } from '../components/DynamicIcon';

const iconMap: Record<string, any> = { HeartPawIcon, BoneIcon, PetHouseIcon };

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
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6 animate-bounce-soft">
              <PawIcon className="w-10 h-10 text-primary" />
              <HeartPawIcon className="w-8 h-8 text-secondary" />
              <PawIcon className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              {hero?.title || 'About'} <span className="text-primary">Pet Care</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {hero?.subtitle || 'Quality products and caring services for all your furry friends'}
            </p>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-lg mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{story?.title || 'Our Mission'}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {story?.content || 'Everything your pet needs, all in one place. We provide quality products and caring services for dogs, cats, and all your furry friends.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {(values?.items || []).map((value: any, idx: number) => {
              const Icon = iconMap[value.icon] || HeartPawIcon;
              return (
                <div key={idx} className="bg-card rounded-3xl p-6 shadow-lg text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-3xl mb-4">
                    <Icon className="text-primary" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-center text-white shadow-xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Make Your Pet Happy?</h2>
            <p className="text-xl opacity-90">
              Join thousands of pet parents who trust us with their furry friends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
