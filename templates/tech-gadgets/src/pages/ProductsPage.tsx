import { Link } from 'wouter';
import { Zap, Filter, Grid, List } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useProducts, useProductsPage, useTheme } from '@/hooks/useContent';
import { parsePageSections, getSectionByType } from '@/lib/pageUtils';
import { DynamicIcon } from '../components/DynamicIcon';

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts({ type: 'product' });
  const { data: pageData, isLoading: pageLoading } = useProductsPage();
  const { data: theme } = useTheme();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;
  const cta = getSectionByType(sections, 'cta')?.content;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-tech-cyan animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartItemCount={0} />

      {/* Page Header */}
      <section className="bg-card border-b border-border">
        <div className="container-tech py-12">
          <h1 className="text-4xl font-bold mb-4 animated-gradient-text">
            {hero?.title || 'Nuestros Productos'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {hero?.subtitle || 'Explora nuestra colección completa de gadgets premium'}
          </p>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="container-tech py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="card-tech sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="h-5 w-5 text-tech-cyan" />
                <h3 className="font-semibold text-lg">Filtros</h3>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h4 className="font-medium mb-3">Categoría</h4>
                  <div className="space-y-2">
                    {['Smartphones', 'Laptops', 'Audio', 'Wearables', 'Computing', 'Smart Home'].map((cat) => (
                      <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                        <input type="checkbox" className="rounded-sm border-border" />
                        <span className="text-sm group-hover:text-tech-cyan transition-colors">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h4 className="font-medium mb-3">Rango de Precio</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Menos de $100', value: '0-100' },
                      { label: '$100 - $500', value: '100-500' },
                      { label: '$500 - $1000', value: '500-1000' },
                      { label: 'Más de $1000', value: '1000+' },
                    ].map((range) => (
                      <label key={range.value} className="flex items-center space-x-2 cursor-pointer group">
                        <input type="checkbox" className="rounded-sm border-border" />
                        <span className="text-sm group-hover:text-tech-cyan transition-colors">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div>
                  <h4 className="font-medium mb-3">Marca</h4>
                  <div className="space-y-2">
                    {['TechCorp', 'Quantum', 'UltraGear', 'SmartHome', 'AudioMax'].map((brand) => (
                      <label key={brand} className="flex items-center space-x-2 cursor-pointer group">
                        <input type="checkbox" className="rounded-sm border-border" />
                        <span className="text-sm group-hover:text-tech-cyan transition-colors">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full btn-tech-secondary text-sm">
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Mostrando <span className="text-foreground font-medium">{products.length}</span> productos
              </p>
              <div className="flex items-center space-x-4">
                <select className="px-4 py-2 bg-card border border-border rounded-sm text-sm">
                  <option>Destacados</option>
                  <option>Precio: Menor a Mayor</option>
                  <option>Precio: Mayor a Menor</option>
                  <option>Más Recientes</option>
                  <option>Más Vendidos</option>
                </select>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-tech-cyan/20 text-tech-cyan rounded-sm">
                    <Grid className="h-4 w-4" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded-sm">
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(9).fill(0).map((_, i) => <div key={i} className="card-tech animate-pulse h-96" />)
              ) : (
                products.map((product: any) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <div className="card-tech group cursor-pointer h-full flex flex-col">
                      <div className="aspect-square bg-background rounded-sm mb-4 overflow-hidden relative">
                        <div className="w-full h-full flex items-center justify-center tech-gradient-subtle group-hover:tech-gradient transition-all">
                          <Zap className="h-16 w-16 text-tech-cyan opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {product.badge && (
                          <span className="absolute top-3 right-3 px-3 py-1 bg-accent rounded-sm text-xs font-medium">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h4 className="font-semibold mb-2 group-hover:text-tech-cyan transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 flex-1">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-tech-cyan">${product.price}</span>
                          <button className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-sm text-sm font-medium transition-colors">
                            Agregar al Carrito
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 space-x-2">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-sm font-medium transition-colors ${
                    page === 1
                      ? 'bg-tech-cyan text-background'
                      : 'bg-card hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </main>
        </div>
      </section>

      <section className="bg-card border-t border-border py-16">
        <div className="container-tech text-center">
          <h2 className="text-3xl font-bold mb-4">{cta?.title || '¿No Encuentras Lo Que Buscas?'}</h2>
          <p className="text-muted-foreground mb-6">{cta?.description || 'Contáctanos para recomendaciones personalizadas'}</p>
          <a href="#contact" className="btn-tech-primary">
            {cta?.buttonText || 'Contáctanos'}
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
