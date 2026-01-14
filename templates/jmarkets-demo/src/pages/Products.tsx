import { Filter, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts, useProductsPage, useTheme } from "@/hooks/useContent";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "@/components/DynamicIcon";

export default function Products() {
  const { data: products = [], isLoading } = useProducts({ type: 'product' });
  const { data: pageData, isLoading: pageLoading } = useProductsPage();
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

      {/* Page Header */}
      <div className="bg-gradient-orange py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{hero?.title || 'Nuestros Productos'}</h1>
          <p className="text-xl text-white/90">{hero?.subtitle || 'Descubre nuestra colección completa'}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="card-modern p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Filtros</h2>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Categorías</h3>
                <div className="space-y-2">
                  {['Todos los Productos', 'Electrónicos', 'Moda', 'Hogar y Jardín', 'Deportes'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                      <input type="checkbox" className="rounded border-border" defaultChecked={cat === 'Todos los Productos'} />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Rango de Precio</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span>Menos de $50</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span>$50 - $100</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span>Más de $100</span>
                  </label>
                </div>
              </div>

              <button className="btn-primary w-full py-2 rounded-md font-medium">
                Aplicar Filtros
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Ordenar por: Destacados</option>
                <option>Precio: Menor a Mayor</option>
                <option>Precio: Mayor a Menor</option>
                <option>Más Recientes</option>
              </select>
            </div>

            {/* Results count */}
            <p className="text-muted-foreground mb-6">
              Mostrando {products.length} productos
            </p>

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-80" />
                ))
              ) : (
                products.map((product: any) => (
                  <ProductCard key={product.id} {...product} />
                ))
              )}
            </div>

            {!isLoading && products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No hay productos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{cta?.title || '¿No Encuentras Lo Que Buscas?'}</h2>
          <p className="text-muted-foreground mb-6">{cta?.description || 'Contáctanos para recomendaciones personalizadas'}</p>
          <a href="#contact" className="btn-primary px-8 py-3 rounded-md font-medium">
            {cta?.buttonText || 'Contáctanos'}
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
