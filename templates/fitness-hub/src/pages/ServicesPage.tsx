import { Link } from 'wouter';
import { Users, Clock } from 'lucide-react';
import { useProducts } from '@/hooks/useContent';

export default function ServicesPage() {
  const { data: services = [], isLoading } = useProducts({ isService: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-600 px-4 py-2 rounded-lg mb-4">
            <Users className="w-5 h-5" />
            <span className="font-bold">PROFESSIONAL TRAINING</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="gradient-energy bg-clip-text text-transparent">FITNESS SERVICES</span>
          </h1>
          <p className="text-xl text-gray-300">Personal training and coaching services</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-gray-900">{services.length}</span> SERVICES AVAILABLE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="card-fitness animate-pulse h-80" />
            ))
          ) : (
            services.map((service: any) => (
              <div key={service.id} className="card-fitness p-6">
                <h3 className="font-black text-gray-900 text-xl mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                {service.duration && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-2xl font-black text-red-600">${service.price}</span>
                  <button className="btn-energy text-sm py-2 px-6">
                    BOOK NOW
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && services.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">NO SERVICES AVAILABLE</h3>
            <p className="text-gray-600">Vuelve pronto</p>
          </div>
        )}
      </div>
    </div>
  );
}
