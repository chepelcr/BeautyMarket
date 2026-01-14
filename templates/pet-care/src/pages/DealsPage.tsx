import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "../components/DynamicIcon";
import React from 'react';
import { Link } from 'wouter';
import { Tag, ShoppingCart } from 'lucide-react';
import { useProducts, useDealsPage, useTheme } from '@/hooks/useContent';

const DealsPage: React.FC = () => {
  const { data: products = [], isLoading } = useProducts({ onSale: true });
  const { data: pageData, isLoading: pageLoading } = useDealsPage();
  const { data: theme } = useTheme();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <section className="bg-gradient-to-r from-primary via-secondary to-accent py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl mb-4">
            <Tag className="w-5 h-5 text-white" />
            <span className="font-bold text-white">{hero?.badge || 'Ofertas Especiales'}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{hero?.title || 'Ofertas y Descuentos'}</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {hero?.subtitle || 'Ahorra en productos premium para tus amigos peludos'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-bold text-foreground">{products.length}</span> deals
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-2xl h-96 border-2 border-border" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="bg-card rounded-2xl border-2 border-border overflow-hidden hover:border-primary transition-all group">
                <div className="aspect-square bg-primary/5 relative">
                  {product.discount && (
                    <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-xl text-sm font-bold">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    )}
                    <span className="text-2xl font-bold text-primary">${product.price}</span>
                  </div>
                  <Link href={`/products/${product.id}`}>
                    <button className="w-full bg-primary text-primary-foreground py-2 rounded-xl font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      View Deal
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No hay ofertas disponibles</h3>
            <p className="text-muted-foreground mb-6">Vuelve pronto para ofertas especiales</p>
            <Link href="/products">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
                Ver Todos los Productos
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
