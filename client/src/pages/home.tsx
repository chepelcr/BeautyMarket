import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCartStore } from "@/store/cart";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import CategoryCard from "@/components/category-card";

export default function Home() {
  const setActiveCategory = useCartStore((state) => state.setActiveCategory);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-light via-cream to-pink-soft">
        <div className="absolute inset-0">
          <svg viewBox="0 0 1440 800" className="absolute inset-0 w-full h-full">
            <path d="M0,400 Q360,300 720,400 T1440,400 L1440,800 L0,800 Z" fill="rgba(233, 30, 99, 0.05)"/>
            <path d="M0,500 Q480,350 960,500 T1920,500 L1920,800 L0,800 Z" fill="rgba(248, 187, 217, 0.1)"/>
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="font-serif text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Catálogo de
                  <span className="text-pink-primary"> Productos</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Descubre nuestra colección de productos de belleza cuidadosamente seleccionados. 
                  Maquillaje, skincare y accesorios para realzar tu belleza natural.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button className="bg-pink-primary hover:bg-pink-600 text-white px-8 py-4 h-auto font-medium">
                    Ver Productos
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-2 border-pink-primary text-pink-primary hover:bg-pink-primary hover:text-white px-8 py-4 h-auto font-medium"
                  onClick={() => document.getElementById('como-comprar')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  ¿Cómo Comprar?
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-2 hover:rotate-0 transition-transform">
                    <img 
                      src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Elegant lip products on marble" 
                      className="rounded-xl w-full h-32 object-cover" 
                    />
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform">
                    <img 
                      src="https://images.unsplash.com/photo-1570554886111-e80fcca6a029?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Skincare serums with droppers" 
                      className="rounded-xl w-full h-32 object-cover" 
                    />
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-1 hover:rotate-0 transition-transform">
                    <img 
                      src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Makeup palette with brushes" 
                      className="rounded-xl w-full h-32 object-cover" 
                    />
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                    <img 
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Premium skincare bottles" 
                      className="rounded-xl w-full h-32 object-cover" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Category Showcase */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">Nueva Colección</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Explora nuestras categorías de productos cuidadosamente seleccionadas para tu rutina de belleza</p>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-gray-200 p-8 h-80 animate-pulse">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-6"></div>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="h-20 bg-gray-300 rounded-lg"></div>
                    <div className="h-20 bg-gray-300 rounded-lg"></div>
                  </div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-tags text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">
                No hay categorías disponibles
              </h3>
              <p className="text-gray-600">
                Las categorías se están configurando. Vuelve pronto.
              </p>
            </div>
          )}
        </div>
      </section>
      {/* How to Buy Section */}
      <section id="como-comprar" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">¿Cómo Comprar?</h2>
            <p className="text-gray-600">Sigue estos sencillos pasos para realizar tu pedido</p>
          </div>
          
          <div className="space-y-12">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-primary text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">Escoge los productos que más te gusten</h3>
                <p className="text-gray-600">Explora nuestro catálogo y añade tus productos favoritos al carrito</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-primary text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">Selecciona la forma de entrega</h3>
                <div className="text-gray-600 space-y-2">
                  <p className="font-medium">Debes ingresar: Provincia, Cantón, Distrito y dirección completa</p>
                  <div className="space-y-1 ml-4">
                    <p>• Correos Costa Rica</p>
                    <p>• Uber Flash</p>
                    <p>• Entrega Personal</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-primary text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">Realiza tu pedido por mensaje</h3>
                <p className="text-gray-600">Envíanos tu pedido a nuestro Instagram @strawberry.essentials o al teléfono 73676745 para coordinar el monto</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-primary text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">Realiza tu pago</h3>
                <p className="text-gray-600">Puedes pagar por SINPE Móvil o en efectivo</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-primary text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">Recibe tus productos y disfruta</h3>
                <p className="text-gray-600">¡Recibe tus productos de belleza y disfruta de tu nueva rutina!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
