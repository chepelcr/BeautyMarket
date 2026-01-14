import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "../components/DynamicIcon";
import { Link } from 'wouter';
import { Tag } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts, useDealsPage, useTheme } from '@/hooks/useContent';

export default function DealsPage() {
  const { data: products = [], isLoading } = useProducts({ onSale: true });
  const { data: pageData, isLoading: pageLoading } = useDealsPage();
  const { data: theme } = useTheme();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-accent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="section-textured py-12">
        <div className="container-organic">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Tag className="w-5 h-5 text-primary" />
              <span className="font-sans font-semibold text-primary">{hero?.badge || 'Ofertas Especiales'}</span>
            </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            {hero?.title || 'Ofertas y Descuentos'}
          </h1>
          <p className="text-foreground/70 text-lg">{hero?.subtitle || 'Tesoros artesanales a precios especiales'}</p>
          </div>
        </div>
      </div>

      <div className="container-organic py-12">
        <div className="mb-6">
          <p className="text-foreground/60">
            <span className="font-bold text-foreground">{products.length}</span> items on sale
          </p>
        </div>

        <div className="product-grid">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-muted rounded-lg h-96" />)
          ) : (
            products.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                category={product.category}
                badge={product.badge}
                rating={product.rating}
                artisan={product.artisan}
              />
            ))
          )}
        </div>

        {!isLoading && products.length === 0 && (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No hay ofertas disponibles</h3>
            <p className="text-foreground/60 mb-6">Vuelve pronto para ofertas especiales</p>
            <Link href="/products"><button className="btn-artisan">Ver Todos los Productos</button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
