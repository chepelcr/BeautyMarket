import React from 'react';
import { Link } from 'wouter';
import { Scissors, Clock } from 'lucide-react';
import { VintageButton, VintageCard, VintageCardHeader, VintageCardContent } from '../components';
import { useProducts } from '@/hooks/useContent';

export function ServicesPage() {
  const { data: services = [], isLoading } = useProducts({ isService: true });

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-cream-50 via-cream-100 to-burgundy-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy-900 text-cream-50 rounded-md mb-4">
              <Scissors size={18} />
              <span className="font-serif text-sm tracking-wider uppercase">Bespoke Services</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-burgundy-900 mb-4">Our Services</h1>
            <p className="text-xl font-body text-burgundy-900/80 max-w-2xl mx-auto">
              Expert tailoring and styling consultations
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-body text-burgundy-900/70">
            {services.length} {services.length === 1 ? 'servicio' : 'servicios'} disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-cream-100 rounded-lg h-80" />)
          ) : (
            services.map((service: any) => (
              <VintageCard key={service.id}>
                <VintageCardHeader>
                  <div className="bg-gradient-to-br from-burgundy-50 to-cream-100 rounded-md p-8 text-center">
                    <Scissors size={48} className="mx-auto text-burgundy-900" />
                  </div>
                </VintageCardHeader>
                <VintageCardContent>
                  <h3 className="text-lg font-serif font-semibold text-burgundy-900 mb-2">{service.name}</h3>
                  <p className="text-sm font-body text-burgundy-900/70 mb-4">{service.description}</p>
                  {service.duration && (
                    <div className="flex items-center gap-2 text-sm text-burgundy-900/70 mb-4">
                      <Clock size={16} />
                      <span className="font-body">{service.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-burgundy-900/20">
                    <span className="text-2xl font-serif font-bold text-burgundy-900">${service.price}</span>
                    <VintageButton variant="primary" size="sm">Reservar</VintageButton>
                  </div>
                </VintageCardContent>
              </VintageCard>
            ))
          )}
        </div>

        {!isLoading && services.length === 0 && (
          <div className="text-center py-20">
            <Scissors size={48} className="mx-auto text-burgundy-900/30 mb-4" />
            <h3 className="text-2xl font-serif font-bold text-burgundy-900 mb-2">No servicios disponibles</h3>
            <p className="text-burgundy-900/70 font-body mb-6">Vuelve pronto</p>
            <Link href="/products"><VintageButton variant="secondary">Browse Collection</VintageButton></Link>
          </div>
        )}
      </section>
    </div>
  );
}
