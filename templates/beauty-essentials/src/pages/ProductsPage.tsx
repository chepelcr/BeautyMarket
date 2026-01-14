import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategories, useProductsPage, useTheme } from "@/hooks/useContent";
import { Filter, SlidersHorizontal } from "lucide-react";
import { parsePageSections, getSectionByType } from "@/lib/pageUtils";
import { DynamicIcon } from "@/components/DynamicIcon";


const sortOptions = [
  { value: "featured", label: "Destacados" },
  { value: "price-low", label: "Precio: Menor a Mayor" },
  { value: "price-high", label: "Precio: Mayor a Menor" },
  { value: "newest", label: "Más Recientes" },
];

export default function ProductsPage() {
  const { data: products = [], isLoading: productsLoading } = useProducts({ type: 'product' });
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories();
  const { data: pageData, isLoading: pageLoading } = useProductsPage();
  const { data: theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const sections = parsePageSections(pageData);
  const hero = getSectionByType(sections, 'hero')?.content;
  const cta = getSectionByType(sections, 'cta')?.content;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DynamicIcon icon={theme?.loadingIcon || 'Sparkles'} className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const categories = ["All", ...categoriesData.map((c: any) => c.name)];

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product: any) => {
          const productCategory = categoriesData.find((c: any) => c.id === product.categoryId);
          return productCategory?.name === selectedCategory;
        });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-pink-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
              {hero?.title || 'Nuestros Productos'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {hero?.subtitle || 'Descubre nuestra colección completa de productos premium'}
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 pb-6 border-b border-border">
            {/* Category Filters */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-primary text-white shadow-beauty"
                        : "bg-white border border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filtros
              </button>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Mostrando <span className="font-bold text-foreground">{sortedProducts.length}</span> productos
              {selectedCategory !== "All" && (
                <span> en <span className="font-bold text-primary">{selectedCategory}</span></span>
              )}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsLoading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-pink-50 rounded-2xl h-96" />
              ))
            ) : (
              sortedProducts.map((product: any) => (
                <ProductCard key={product.id} {...product} />
              ))
            )}
          </div>

          {/* Empty State */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                No se encontraron productos
              </h3>
              <p className="text-muted-foreground mb-6">
                Intenta ajustar tus filtros para encontrar lo que buscas
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSortBy("featured");
                }}
                className="btn-beauty"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 section-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {cta?.title || '¿No Encuentras Lo Que Buscas?'}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {cta?.description || 'Contáctanos para recomendaciones personalizadas de productos'}
            </p>
            <a href="#contact" className="btn-beauty">
              {cta?.buttonText || 'Contáctanos'}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
