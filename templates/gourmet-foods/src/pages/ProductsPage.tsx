import { useProductsPage, useTheme, useProducts, useCategories } from "@/hooks/useContent";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "@/components/DynamicIcon";
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

export default function ProductsPage() {
  const { data: products = [], isLoading: productsLoading } = useProducts({ type: 'product' });
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories();
  const { data: pageData, isLoading: pageLoading } = useProductsPage();
  const { data: theme } = useTheme();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;
  const cta = getSectionByType(sections, 'cta')?.content;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-gourmet-red animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-stone-100 border-b border-stone-200">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-3">
              {hero?.title || 'Todos los Productos'}
            </h1>
            <p className="text-lg text-stone-600">
              {hero?.subtitle || 'Descubre nuestra colección completa de alimentos gourmet premium'}
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filtros Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-stone-200">
                    <h2 className="font-serif font-semibold text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5 text-gourmet-red" />
                      Filtros
                    </h2>
                    <button className="text-sm text-gourmet-red hover:text-gourmet-gold transition-colors">
                      Limpiar
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <h3 className="font-semibold mb-3">Categorías</h3>
                    <div className="space-y-2">
                      {[
                        'Todos los Productos',
                        'Quesos Artesanales',
                        'Embutidos',
                        'Aceites Especiales',
                        'Café Gourmet',
                        'Selección Orgánica',
                      ].map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-stone-300" />
                          <span className="text-sm text-stone-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <h3 className="font-semibold mb-3">Rango de Precio</h3>
                    <div className="space-y-2">
                      {['Menos de $20', '$20 - $40', '$40 - $60', 'Más de $60'].map((range) => (
                        <label key={range} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-stone-300" />
                          <span className="text-sm text-stone-700">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Filter */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <h3 className="font-semibold mb-3">Dietético</h3>
                    <div className="space-y-2">
                      {['Orgánico', 'Vegano', 'Sin Gluten', 'Sin Lácteos', 'Keto'].map(
                        (dietary) => (
                          <label key={dietary} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-stone-300" />
                            <span className="text-sm text-stone-700">{dietary}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {/* Sort & View Options */}
                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-stone-200">
                  <p className="text-sm text-stone-600">
                    Mostrando <strong>{products.length}</strong> productos
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-stone-500" />
                      <select className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gourmet-red">
                        <option>Ordenar por: Destacados</option>
                        <option>Precio: Menor a Mayor</option>
                        <option>Precio: Mayor a Menor</option>
                        <option>Más Recientes</option>
                        <option>Mejor Calificados</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productsLoading ? (
                    Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-stone-100 rounded-lg h-96" />)
                  ) : (
                    products.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))
                  )}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === 1
                          ? 'bg-gourmet-red text-white'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className="bg-stone-100 border-t border-stone-200 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
            {cta?.title || '¿No Encuentras Lo Que Buscas?'}
          </h2>
          <p className="text-lg text-stone-600 mb-6">
            {cta?.description || 'Contáctanos para recomendaciones personalizadas'}
          </p>
          <a href="#contact" className="inline-block px-8 py-3 bg-gourmet-red text-white rounded-lg hover:bg-gourmet-gold transition-colors">
            {cta?.buttonText || 'Contáctanos'}
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
