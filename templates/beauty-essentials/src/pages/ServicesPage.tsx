import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useProducts, useServicesPage, useTheme } from "@/hooks/useContent";
import { Sparkles, Clock } from "lucide-react";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "@/components/DynamicIcon";

export default function ServicesPage() {
  const { data: services = [], isLoading } = useProducts({ isService: true });
  const { data: pageData, isLoading: pageLoading } = useServicesPage();
  const { data: theme } = useTheme();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;
  const cta = getSectionByType(sections, 'cta')?.content;

  if (pageLoading) {
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
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Spa & Beauty</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
              {hero?.title || 'Nuestros Servicios'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {hero?.subtitle || 'Servicios profesionales diseñados para brindarte la mejor experiencia'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <p className="text-muted-foreground">
              <span className="font-bold text-foreground">{services.length}</span> servicios disponibles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-pink-50 rounded-2xl h-80" />
              ))
            ) : (
              services.map((service: any) => (
                <div key={service.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-beauty transition-shadow">
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">{service.name}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  
                  {service.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                    <button className="btn-beauty text-sm py-2 px-6">Reservar</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {!isLoading && services.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">No hay servicios disponibles</h3>
              <p className="text-muted-foreground mb-6">Vuelve pronto</p>
              <Link href="/products"><a className="btn-beauty">Ver Productos</a></Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 section-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {cta?.title || '¿Listo Para Comenzar?'}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {cta?.description || 'Agenda tu cita hoy y experimenta nuestros servicios profesionales'}
            </p>
            <a href="#contact" className="btn-beauty">
              {cta?.buttonText || 'Agendar Cita'}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
