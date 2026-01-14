import { Link } from 'wouter';
import { Wrench, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useProducts } from '@/hooks/useContent';

export default function ServicesPage() {
  const { data: services = [], isLoading } = useProducts({ isService: true });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartItemCount={0} />

      <section className="relative overflow-hidden grid-pattern scanlines">
        <div className="container-tech py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tech-cyan/20 text-tech-cyan rounded-sm mb-6">
              <Wrench className="w-5 h-5" />
              <span className="font-bold">TECH SUPPORT</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-tech-shadow">
              <span className="animated-gradient-text">Tech Services</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Professional installation, repair, and support services
            </p>
          </div>
        </div>
      </section>

      <section className="container-tech py-16">
        <div className="mb-6">
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">{services.length}</span> servicios disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="card-tech animate-pulse h-80" />)
          ) : (
            services.map((service: any) => (
              <div key={service.id} className="card-tech p-6">
                <h3 className="text-xl font-semibold mb-2 text-tech-cyan">{service.name}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                {service.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-2xl font-bold text-tech-cyan">${service.price}</span>
                  <button className="btn-tech-accent text-sm py-2 px-6">Reservar</button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && services.length === 0 && (
          <div className="text-center py-16">
            <Wrench className="h-16 w-16 text-tech-cyan mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No servicios disponibles</h3>
            <p className="text-muted-foreground mb-6">Vuelve pronto</p>
            <Link href="/products"><button className="btn-tech-accent">Ver Productos</button></Link>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
