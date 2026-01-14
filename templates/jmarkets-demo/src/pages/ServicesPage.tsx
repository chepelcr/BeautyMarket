import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useProducts } from "@/hooks/useContent";
import { Clock, Briefcase } from "lucide-react";

export default function ServicesPage() {
  const { data: services = [], isLoading } = useProducts({ isService: true });

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-gradient-orange-blue py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
            <Briefcase className="w-5 h-5" />
            <span className="font-semibold">Professional Services</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-white/90">Expert solutions for your needs</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-muted-foreground">
              <span className="font-bold text-foreground">{services.length}</span> servicios disponibles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-80" />)
            ) : (
              services.map((service: any) => (
                <div key={service.id} className="card-modern p-6">
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  {service.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                    <button className="btn-primary px-6 py-2 rounded-md font-semibold shadow-orange">Book</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {!isLoading && services.length === 0 && (
            <div className="text-center py-16">
              <Briefcase className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No servicios disponibles</h3>
              <Link href="/products"><a className="btn-primary px-8 py-3 rounded-md font-semibold shadow-orange">Ver Productos</a></Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
