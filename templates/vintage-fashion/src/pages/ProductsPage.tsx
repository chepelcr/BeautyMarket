import React, { useState } from 'react';
import { Link } from 'wouter';
import { Filter, SlidersHorizontal, ShoppingCart, Check } from 'lucide-react';
import {
  VintageButton,
  VintageCard,
  VintageCardHeader,
  VintageCardContent,
  VintageBadge,
  VintageDivider,
} from '../components';
import { useCartStore } from '@/store/cart';
import { useProducts, useCategories, useProductsPage, useTheme } from '@/hooks/useContent';
import { parsePageSections, getSectionByType } from '@/lib/pageUtils';
import { DynamicIcon } from '../components/DynamicIcon';

export function ProductsPage() {
  const { data: products = [], isLoading: productsLoading } = useProducts({ type: 'product' });
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories();
  const { data: pageData, isLoading: pageLoading } = useProductsPage();
  const { data: theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const { addToCart } = useCartStore();

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;
  const cta = getSectionByType(sections, 'cta')?.content;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-mustard-500 animate-pulse" />
      </div>
    );
  }

  const categories = [
    { id: 'all', name: 'Todos' },
    ...categoriesData.map((c: any) => ({ id: c.id, name: c.name })),
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p: any) => p.category === selectedCategory);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: null,
    });
    setAddingToCart(product.id);
    setTimeout(() => setAddingToCart(null), 1500);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-cream-50 via-cream-100 to-burgundy-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-burgundy-900 mb-4">
              {hero?.title || 'Nuestra Colección'}
            </h1>
            <p className="text-xl font-body text-burgundy-900/80 max-w-2xl mx-auto">
              {hero?.subtitle || 'Explora nuestra selección cuidadosamente curada de piezas vintage'}
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Sorting */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 font-serif text-sm tracking-wider uppercase rounded-md border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-burgundy-900 text-cream-50 border-burgundy-900'
                    : 'bg-card text-burgundy-900 border-burgundy-900/30 hover:border-burgundy-900'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} className="text-burgundy-900" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 font-serif text-sm border-2 border-burgundy-900/30 rounded-md bg-card text-burgundy-900 focus:border-burgundy-900 outline-none"
            >
              <option value="featured">Destacados</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="newest">Más Recientes</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm font-body text-burgundy-900/70">
            Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsLoading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-cream-100 rounded-lg h-96" />)
          ) : (
            filteredProducts.map((product: any) => (
            <VintageCard key={product.id} hover>
              <VintageCardHeader>
                <div className={`aspect-square bg-gradient-to-br ${product.gradient} rounded-md flex items-center justify-center relative`}>
                  <div className="text-center">
                    <div className="text-6xl mb-2">{product.emoji}</div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <VintageBadge variant={product.badge}>
                      {product.badge === 'bestseller' ? 'Best' : product.badge}
                    </VintageBadge>
                  </div>
                </div>
              </VintageCardHeader>
              <VintageCardContent>
                <h3 className="text-lg font-serif font-semibold text-burgundy-900 mb-3">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xl font-serif font-bold text-burgundy-900">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm font-body text-burgundy-900/50 line-through ml-2">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <VintageButton variant="outline" size="sm" className="w-full">
                      Ver Detalles
                    </VintageButton>
                  </Link>
                  <VintageButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className={addingToCart === product.id ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {addingToCart === product.id ? <Check size={18} /> : <ShoppingCart size={18} />}
                  </VintageButton>
                </div>
              </VintageCardContent>
            </VintageCard>
          ))
          )}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Filter size={48} className="mx-auto text-burgundy-900/30 mb-4" />
            <h3 className="text-2xl font-serif font-bold text-burgundy-900 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-burgundy-900/70 font-body mb-6">
              Intenta ajustar tus filtros para ver más productos
            </p>
            <VintageButton variant="secondary" onClick={() => setSelectedCategory('all')}>
              Clear Filters
            </VintageButton>
          </div>
        )}
      </section>

      <VintageDivider />

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gradient-to-br from-burgundy-900 to-burgundy-800 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-cream-50 mb-4">
            {cta?.title || '¿No Encuentras Lo Que Buscas?'}
          </h2>
          <p className="text-lg font-body text-cream-50/80 mb-6 max-w-2xl mx-auto">
            {cta?.description || 'Contáctanos para recomendaciones personalizadas'}
          </p>
          <VintageButton variant="secondary" size="lg">
            {cta?.buttonText || 'Contáctanos'}
          </VintageButton>
        </div>
      </section>
    </div>
  );
}
