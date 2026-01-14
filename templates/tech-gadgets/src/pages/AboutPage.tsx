import { Cpu, Zap, Shield, Award } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAboutPage, useTheme } from '../hooks/useContent';
import { parsePageSections, getSectionByType } from '../lib/pageUtils';
import { DynamicIcon } from '../components/DynamicIcon';

const iconMap: Record<string, any> = { Cpu, Zap, Shield, Award };

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
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-tech-cyan animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartItemCount={0} />

      <div className="container-tech py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 animated-gradient-text">{hero?.title || 'About Tech Gadgets'}</h1>
          <p className="text-xl text-muted-foreground mb-12">
            {hero?.subtitle || 'Your trusted source for cutting-edge technology and premium electronics.'}
          </p>

          <div className="card-tech mb-12">
            <h2 className="text-3xl font-bold mb-4 text-tech-cyan">{story?.title || 'Our Mission'}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {story?.content || 'We bring you the latest innovations in technology, from smartphones to smart home devices.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {(values?.items || []).map((value: any, idx: number) => {
              const Icon = iconMap[value.icon] || Cpu;
              return (
                <div key={idx} className="card-tech">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-tech-electric/10 rounded-sm">
                      <Icon className="h-8 w-8 text-tech-cyan" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tech-gradient rounded-sm p-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">Join the Tech Revolution</h2>
            <p className="text-white/90 mb-6">
              Experience the future of technology with our curated selection of premium gadgets.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
