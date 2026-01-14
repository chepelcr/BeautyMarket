import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Users, Award, Shield, Heart } from "lucide-react";
import { useAboutPage, useContact, useTheme } from "@/hooks/useContent";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "@/components/DynamicIcon";

const iconMap: Record<string, any> = { Users, Award, Shield, Heart };

export default function AboutPage() {
  const { data: pageData, isLoading } = useAboutPage();
  const { data: contact } = useContact();
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
      <Navbar />

      <section className="bg-gradient-orange-blue py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{hero?.title || 'About Us'}</h1>
          <p className="text-xl text-white/90">{hero?.subtitle || 'Your trusted marketplace since 2020'}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">{story?.title || 'Our Story'}</h2>
          <p className="text-muted-foreground mb-6 text-lg">
            {story?.content || 'We were founded to connect buyers and sellers in a trusted, easy-to-use marketplace.'}
          </p>

          <h2 className="text-3xl font-bold mb-6 mt-12">{values?.title || 'Why Choose Us'}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(values?.items || []).map((item: any, idx: number) => {
              const Icon = iconMap[item.icon] || Users;
              return (
                <div key={idx} className="card-modern p-6">
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
