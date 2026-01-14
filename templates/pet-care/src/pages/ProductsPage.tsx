import { useProductsPage, useTheme } from "@/hooks/useContent";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "@/components/DynamicIcon";
import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import { DogIcon, CatIcon, BirdIcon } from '../components/PetIcons';
import { useProducts } from '@/hooks/useContent';

// Mock product data
const mockProducts: Product[] = [
  {
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop',
    category: 'Smart Devices',
    rating: 4,
    reviews: 118,
    inStock: true,
    badge: 'New',
  },
];

const ProductsPage: React.FC = () => {
  const { data: mockProducts = [], isLoading } = useProducts({ type: 'product' });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  const categories = ['Todos', 'Comida para Perros', 'Juguetes para Gatos', 'Camas para Perros', 'Suministros para Gatos', 'Accesorios para Perros', 'Suministros para Pájaros', 'Aseo para Perros', 'Dispositivos Inteligentes'];

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || categoriesData.find((c: any) => c.id === product.categoryId)?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    console.log('Added to cart:', product.name);
    // In a real app, this would update cart state
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="relative z-10">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary via-secondary to-accent py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Tienda de Productos para Mascotas
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Todo lo que tu amigo peludo necesita, desde comida hasta juguetes y accesorios
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none bg-card text-foreground transition-colors"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors bg-card">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="font-medium">Filtros</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors bg-card">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Ordenar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card text-foreground border-2 border-border hover:border-primary hover:bg-primary/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Pet Type Quick Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <button className="flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all group">
            <div className="bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <DogIcon className="text-primary" size={32} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">Para Perros</h3>
              <p className="text-sm text-muted-foreground">Comida, juguetes, accesorios</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-all group">
            <div className="bg-secondary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <CatIcon className="text-secondary" size={32} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">Para Gatos</h3>
              <p className="text-sm text-muted-foreground">Premios, arena, juguetes</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-accent/20 hover:border-accent hover:bg-accent/5 transition-all group">
            <div className="bg-accent/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <BirdIcon className="text-accent" size={32} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">Otras Mascotas</h3>
              <p className="text-sm text-muted-foreground">Pájaros, peces, animales pequeños</p>
            </div>
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Mostrando <span className="font-bold text-foreground">{filteredProducts.length}</span> productos
          </p>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-card rounded-2xl h-96" />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.has(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">No hay productos disponibles</p>
            <p className="text-muted-foreground">Intenta ajustar tu búsqueda o filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
