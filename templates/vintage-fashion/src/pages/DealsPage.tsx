import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "../components/DynamicIcon";
import React from 'react';
import { Link } from 'wouter';
import { Tag, ShoppingCart, Check } from 'lucide-react';
import { VintageButton, VintageCard, VintageCardHeader, VintageCardContent, VintageBadge } from '../components';
import { useCartStore } from '@/store/cart';
import { useProducts, useDealsPage, useTheme } from '@/hooks/useContent';

export function DealsPage() {
  const { data: products = [], isLoading } = useProducts({ onSale: true });
  const { data: pageData, isLoading: pageLoading } = useDealsPage();
  const { data: theme } = useTheme();
  const [addingToCart, setAddingToCart] = React.useState<number | null>(null);
  const { addToCart } = useCartStore();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-mustard-500 animate-pulse" />
      </div>
    );
  }

  const handleAddToCart = (product: any) => {
    addToCart({ id: product.id.toString(), name: product.name, price: product.price, imageUrl: null });
    setAddingToCart(product.id);
    setTimeout(() => setAddingToCart(null), 1500);
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-cream-50 via-cream-100 to-burgundy-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy-900 text-cream-50 rounded-md mb-4">
              <Tag size={18} />
              <span className="font-serif text-sm tracking-wider uppercase">{hero?.badge || 'Ofertas Especiales'}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-burgundy-900 mb-4">{hero?.title || 'Ofertas y Descuentos'}</h1>
            <p className="text-xl font-body text-burgundy-900/80 max-w-2xl mx-auto">
              {hero?.subtitle || 'Piezas atemporales a precios excepcionales'}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-body text-burgundy-900/70">
            {products.length} {products.length === 1 ? 'item' : 'items'} on sale
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-cream-100 rounded-lg h-96" />)
          ) : (
            products.map((product: any) => (
              <VintageCard key={product.id} hover>
                <VintageCardHeader>
                  <div className={`aspect-square bg-gradient-to-br from-burgundy-50 to-cream-100 rounded-md flex items-center justify-center relative`}>
                    <div className="text-6xl">{product.emoji || '👗'}</div>
                    <div className="absolute top-3 right-3">
                      <VintageBadge variant="sale">SALE</VintageBadge>
                    </div>
                  </div>
                </VintageCardHeader>
                <VintageCardContent>
                  <h3 className="text-lg font-serif font-semibold text-burgundy-900 mb-3">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    {product.originalPrice && (
                      <span className="text-sm font-body text-burgundy-900/50 line-through">${product.originalPrice}</span>
                    )}
                    <span className="text-xl font-serif font-bold text-burgundy-900">${product.price}</span>
                    {product.discount && (
                      <span className="text-xs font-body text-accent">-{product.discount}%</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <VintageButton variant="outline" size="sm" className="w-full">View Details</VintageButton>
                    </Link>
                    <VintageButton variant="primary" size="sm" onClick={() => handleAddToCart(product)} className={addingToCart === product.id ? 'bg-green-600 hover:bg-green-700' : ''}>
                      {addingToCart === product.id ? <Check size={18} /> : <ShoppingCart size={18} />}
                    </VintageButton>
                  </div>
                </VintageCardContent>
              </VintageCard>
            ))
          )}
        </div>

        {!isLoading && products.length === 0 && (
          <div className="text-center py-20">
            <Tag size={48} className="mx-auto text-burgundy-900/30 mb-4" />
            <h3 className="text-2xl font-serif font-bold text-burgundy-900 mb-2">No sales at the moment</h3>
            <p className="text-burgundy-900/70 font-body mb-6">Vuelve pronto para nuevas ofertas</p>
            <Link href="/products"><VintageButton variant="secondary">Ver Colección</VintageButton></Link>
          </div>
        )}
      </section>
    </div>
  );
}
