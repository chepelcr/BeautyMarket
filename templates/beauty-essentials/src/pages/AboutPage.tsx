import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Leaf, Award, Users } from "lucide-react";
import { useAboutPage, useContact, useTheme } from "@/hooks/useContent";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "@/components/DynamicIcon";

const iconMap: Record<string, any> = { Heart, Leaf, Award, Users };

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

      <section className="bg-gradient-to-br from-pink-50 via-white to-pink-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
              {hero?.title || 'About Us'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {hero?.subtitle || 'Bringing natural beauty to life since 2020'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">{story?.title || 'Our Story'}</h2>
              <p className="text-muted-foreground mb-6">
                {story?.content || 'We were founded with a simple mission: to provide high-quality, natural products that enhance your natural beauty.'}
              </p>

              <h2 className="text-3xl font-serif font-bold text-foreground mb-4 mt-12">{values?.title || 'Our Values'}</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {(values?.items || []).map((item: any, idx: number) => {
                  const Icon = iconMap[item.icon] || Leaf;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                Have questions? We'd love to hear from you. Reach out to our team at{' '}
                <a href={`mailto:${contact?.email || 'contact@example.com'}`} className="text-primary hover:underline">
                  {contact?.email || 'contact@example.com'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
