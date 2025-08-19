import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import ProductCard from "@/components/products/product-card";
import ProductFilters from "@/components/products/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/store/cart";
import type { Product, Category } from "@shared/schema";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";
import { apiRequest } from "@/lib/queryClient";

export default function Products() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const activeCategory = useCartStore((state) => state.activeCategory);
  const clearActiveCategory = useCartStore((state) => state.clearActiveCategory);
  
  // Set dynamic page title
  useDynamicTitle("Productos");

  // Set initial category from URL parameter or store
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    } else if (activeCategory) {
      setSelectedCategory(activeCategory);
      clearActiveCategory();
    }
  }, [params.category, activeCategory, clearActiveCategory]);

  // Handle category change with URL updates
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      setLocation("/products");
    } else {
      setLocation(`/products/${category}`);
    }
  };

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          apiRequest('GET', '/api/products'),
          apiRequest('GET', '/api/categories')
        ]);
        setAllProducts(await productsRes.json());
        setCategories(await categoriesRes.json());
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    if (selectedCategory === "all") {
      return allProducts;
    }
    
    // Find category by slug to get ID
    const category = categories?.find(cat => cat.slug === selectedCategory);
    if (!category) return [];
    
    return allProducts.filter(product => product.categoryId === category.id);
  }, [allProducts, categories, selectedCategory]);

  if (isLoading) {
    return (
      <div className="py-5 bg-cream dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold text-gray-900 dark:text-white mb-4">Nuestros Productos</h1>
            <p className="text-gray-600 dark:text-gray-300">Descubre nuestra selección de productos de belleza premium</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <Skeleton className="w-full h-64" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-cream dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-gray-900 dark:text-white mb-4">Nuestros Productos</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Descubre nuestra selección de productos de belleza premium</p>
          
          <ProductFilters 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategoryChange} 
          />
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-serif text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedCategory === "all" 
                  ? "No hay productos disponibles en este momento." 
                  : `No hay productos en la categoría "${selectedCategory}".`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
