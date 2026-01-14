import React from 'react';
import { Search, Clock } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import { useProducts } from '@/hooks/useContent';

const ServicesPage: React.FC = () => {
  const { data: services = [], isLoading } = useProducts({ isService: true });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  const filteredServices = services.filter((service: any) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (service: Product) => {
    console.log('Book service:', service.name);
  };

  const handleToggleFavorite = (serviceId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId);
      } else {
        newFavorites.add(serviceId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="relative z-10">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary via-secondary to-accent py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Pet Services
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Professional grooming, training, and care services for your beloved pets
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none bg-card text-foreground transition-colors"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-bold text-foreground">{filteredServices.length}</span> services
          </p>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-2xl h-96" />
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service: any) => (
              <div key={service.id} className="bg-card rounded-2xl border-2 border-border p-6 hover:border-primary transition-all">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{service.description}</p>
                  {service.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-2xl font-bold text-primary">${service.price}</span>
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-semibold hover:scale-105 transition-transform">
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">No hay servicios disponibles</p>
            <p className="text-muted-foreground">Intenta ajustar tu búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
