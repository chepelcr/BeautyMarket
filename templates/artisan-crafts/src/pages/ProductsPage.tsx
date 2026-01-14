import { useProductsPage, useTheme } from "@/hooks/useContent";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "@/components/DynamicIcon";
import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useContent';

export default function ProductsPage() {
  const { data: products = [], isLoading: productsLoading } = useProducts({ type: 'product' });
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos' },
    ...categoriesData.map((c: any) => ({ id: c.id, label: c.name })),
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p: any) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="section-textured py-12">
        <div className="container-organic">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Tienda de <span className="text-gradient-artisan">Artesanías</span>
          </h1>
          <p className="text-foreground/70 text-lg">
            Descubre tesoros únicos hechos a mano por artesanos talentosos
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card border-b border-border sticky top-16 z-40 shadow-soft">
        <div className="container-organic py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar artesanías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-organic pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary transition-colors font-sans font-semibold">
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filtrar</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary transition-colors font-sans font-semibold">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Ordenar</span>
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-sans font-semibold text-sm transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-artisan'
                    : 'bg-muted text-foreground hover:bg-primary/10'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-organic py-12">
        <div className="mb-6">
          <p className="text-foreground/60">
            Mostrando <span className="font-bold text-foreground">{filteredProducts.length}</span> productos
          </p>
        </div>

        <div className="product-grid">
          {productsLoading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-muted rounded-lg h-96" />)
          ) : (
            filteredProducts.map((product: any) => (
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">
              No hay productos disponibles. Vuelve pronto para nuevas creaciones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
