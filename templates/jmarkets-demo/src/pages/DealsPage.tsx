import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts, useDealsPage, useTheme } from "@/hooks/useContent";
import { Tag, Percent } from "lucide-react";
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

      <section className="bg-gradient-orange-blue py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
            <Percent className="w-5 h-5" />
            <span className="font-semibold">{hero?.badge || 'Ofertas Especiales'}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{hero?.title || 'Ofertas y Descuentos'}</h1>
          <p className="text-xl text-white/90">{hero?.subtitle || 'Ahorra en grande en tus productos favoritos'}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-muted-foreground">
              <span className="font-bold text-foreground">{products.length}</span> ofertas disponibles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-80" />)
            ) : (
              products.map((product: any) => <ProductCard key={product.id} {...product} />)
            )}
          </div>

          {!isLoading && products.length === 0 && (
            <div className="text-center py-16">
              <Tag className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No deals right now</h3>
              <p className="text-muted-foreground mb-6">Vuelve pronto para nuevas ofertas</p>
              <Link href="/products"><a className="btn-primary px-8 py-3 rounded-md font-semibold shadow-orange">Ver Productos</a></Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
