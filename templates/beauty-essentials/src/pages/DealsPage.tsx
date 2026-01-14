import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts, useDealsPage, useTheme } from "@/hooks/useContent";
import { Tag, Sparkles } from "lucide-react";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "@/components/DynamicIcon";

export default function DealsPage() {
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
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-pink-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary/20 mb-4">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{hero?.badge || 'Ofertas Especiales'}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
              {hero?.title || 'Ofertas y Descuentos'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {hero?.subtitle || 'Ahorra en grande en tus productos favoritos con nuestras ofertas exclusivas'}
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-bold text-foreground">{products.length}</span> deals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-pink-50 rounded-2xl h-96" />
              ))
            ) : (
              products.map((product: any) => (
                <ProductCard key={product.id} {...product} />
              ))
            )}
          </div>

          {!isLoading && products.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                No hay ofertas disponibles
              </h3>
              <p className="text-muted-foreground mb-6">
                Vuelve pronto para ofertas increíbles!
              </p>
              <Link href="/products">
                <a className="btn-beauty">Ver Todos los Productos</a>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
