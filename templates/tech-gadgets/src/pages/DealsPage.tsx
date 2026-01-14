import { Link } from 'wouter';
import { Zap, Tag } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useProducts, useDealsPage, useTheme } from '@/hooks/useContent';
import { parsePageSections, getSectionByType } from '@/lib/pageUtils';
import { DynamicIcon } from '../components/DynamicIcon';

export default function DealsPage() {
  const { data: products = [], isLoading } = useProducts({ onSale: true });
  const { data: pageData, isLoading: pageLoading } = useDealsPage();
  const { data: theme } = useTheme();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;

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

      <section className="relative overflow-hidden grid-pattern scanlines">
        <div className="container-tech py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-sm mb-6">
              <Tag className="w-5 h-5" />
              <span className="font-bold">{hero?.badge || 'OFERTAS ESPECIALES'}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-tech-shadow">
              <span className="animated-gradient-text">{hero?.title || 'Ofertas y Descuentos'}</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {hero?.subtitle || 'Descuentos exclusivos en gadgets y electrónicos premium'}
            </p>
          </div>
        </div>
      </section>

      <section className="container-tech py-16">
        <div className="mb-6">
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">{products.length}</span> ofertas disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="card-tech animate-pulse h-96" />)
          ) : (
            products.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="card-tech group cursor-pointer h-full flex flex-col">
                  <div className="aspect-square bg-background rounded-sm mb-4 overflow-hidden relative">
                    <div className="w-full h-full flex items-center justify-center tech-gradient-subtle group-hover:tech-gradient transition-all">
                      <Zap className="h-16 w-16 text-tech-cyan opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {product.discount && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-accent rounded-sm text-xs font-medium">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-semibold mb-2 group-hover:text-tech-cyan transition-colors">{product.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 flex-1">{product.description}</p>
                    <div className="flex items-center gap-3">
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                      )}
                      <span className="text-2xl font-bold text-tech-cyan">${product.price}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {!isLoading && products.length === 0 && (
          <div className="text-center py-16">
            <Tag className="h-16 w-16 text-tech-cyan mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No hay ofertas disponibles</h3>
            <p className="text-muted-foreground mb-6">Vuelve pronto para ofertas increíbles</p>
            <Link href="/products"><button className="btn-tech-accent">Ver Todos los Productos</button></Link>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
