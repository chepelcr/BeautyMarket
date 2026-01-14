import { Link } from 'wouter';
import { ChefHat, Clock } from 'lucide-react';
import { useProducts } from '@/hooks/useContent';

export default function ServicesPage() {
  const { data: services = [], isLoading } = useProducts({ isService: true });

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-br from-gourmet-red to-gourmet-gold py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg mb-4">
            <ChefHat className="w-5 h-5" />
            <span className="font-sans font-semibold">Catering & Events</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Our Services</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Professional catering and gourmet food services
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <p className="text-stone-600 font-sans">
            <span className="font-bold text-stone-900">{services.length}</span> servicios disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg h-80 border border-stone-200" />
            ))
          ) : (
            services.map((service: any) => (
              <div key={service.id} className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-serif font-bold text-stone-900 text-xl mb-2">{service.name}</h3>
                <p className="text-stone-600 font-sans mb-4">{service.description}</p>
                
                {service.duration && (
                  <div className="flex items-center gap-2 text-sm text-stone-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                  <span className="text-2xl font-bold text-gourmet-red">${service.price}</span>
                  <button className="bg-gourmet-red text-white px-6 py-2 rounded-lg font-sans font-semibold hover:bg-gourmet-gold transition-colors">
                    Inquire
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && services.length === 0 && (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">No servicios disponibles</h3>
            <p className="text-stone-600 font-sans mb-6">Vuelve pronto</p>
            <Link href="/products">
              <button className="bg-gourmet-red text-white px-8 py-3 rounded-lg font-sans font-semibold hover:bg-gourmet-gold transition-colors">
                Ver Productos
              </button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
