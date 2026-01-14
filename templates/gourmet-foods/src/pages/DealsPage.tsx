import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "../components/DynamicIcon";
import { Link } from 'wouter';
import { Tag, ChefHat } from 'lucide-react';
import { useProducts, useDealsPage, useTheme } from '@/hooks/useContent';

export default function DealsPage() {
  const { data: products = [], isLoading } = useProducts({ onSale: true });
  const { data: pageData, isLoading: pageLoading } = useDealsPage();
  const { data: theme } = useTheme();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-gourmet-red animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-br from-gourmet-red to-gourmet-gold py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg mb-4">
            <Tag className="w-5 h-5" />
            <span className="font-sans font-semibold">{hero?.badge || 'Ofertas Especiales'}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">{hero?.title || 'Ofertas y Descuentos'}</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {hero?.subtitle || 'Alimentos gourmet premium a precios excepcionales'}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <p className="text-stone-600 font-sans">
            <span className="font-bold text-stone-900">{products.length}</span> items on sale
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg h-96 border border-stone-200" />
            ))
          ) : (
            products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-lg border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-stone-100 relative">
                  <div className="absolute top-3 right-3 bg-gourmet-red text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.discount ? `-${product.discount}%` : 'SALE'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-bold text-stone-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-stone-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {product.originalPrice && (
                      <span className="text-sm text-stone-400 line-through">${product.originalPrice}</span>
                    )}
                    <span className="text-2xl font-bold text-gourmet-red">${product.price}</span>
                  </div>
                  <Link href={`/products/${product.id}`}>
                    <button className="w-full bg-gourmet-red text-white py-2 rounded-lg font-sans font-semibold hover:bg-gourmet-gold transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && products.length === 0 && (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">No hay ofertas disponibles</h3>
            <p className="text-stone-600 font-sans mb-6">Vuelve pronto para especiales gourmet</p>
            <Link href="/products">
              <button className="bg-gourmet-red text-white px-8 py-3 rounded-lg font-sans font-semibold hover:bg-gourmet-gold transition-colors">
                Ver Todos los Productos
              </button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
