import { Link } from 'wouter';
import { Palette, Clock } from 'lucide-react';
import { useProducts } from '@/hooks/useContent';

export default function ServicesPage() {
  const { data: services = [], isLoading } = useProducts({ isService: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="section-textured py-12">
        <div className="container-organic">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <span className="font-sans font-semibold text-primary">Custom Services</span>
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Artisan <span className="text-gradient-artisan">Services</span>
            </h1>
            <p className="text-foreground/70 text-lg">Custom commissions and workshops</p>
          </div>
        </div>
      </div>

      <div className="container-organic py-12">
        <div className="mb-6">
          <p className="text-foreground/60">
            <span className="font-bold text-foreground">{services.length}</span> servicios disponibles
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-muted rounded-lg h-80" />)
          ) : (
            services.map((service: any) => (
              <div key={service.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-artisan transition-shadow">
                <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
                <p className="text-foreground/70 mb-4">{service.description}</p>
                {service.duration && (
                  <div className="flex items-center gap-2 text-sm text-foreground/60 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-2xl font-bold text-primary">${service.price}</span>
                  <button className="btn-artisan text-sm py-2 px-6">Inquire</button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && services.length === 0 && (
          <div className="text-center py-16">
            <Palette className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No servicios disponibles</h3>
            <p className="text-foreground/60 mb-6">Vuelve pronto</p>
            <Link href="/products"><button className="btn-artisan">Browse Items</button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
