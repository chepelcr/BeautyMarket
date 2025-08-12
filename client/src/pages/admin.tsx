import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ProductForm from "@/components/admin/product-form";
import CategoriesManager from "@/components/admin/categories-manager";
import { CmsManager } from "@/components/admin/cms-manager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SimpleThemeToggle } from "@/components/simple-theme-toggle";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";

export default function Admin() {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'content'>('products');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();

  // Set dynamic page title
  useDynamicTitle("Administración");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fix scrolling issue by scrolling to top when accessing admin
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate("/login");
        }, 500);
        return false;
      }
      return failureCount < 3;
    }
  });

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/products/${productToDelete.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      });
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate("/login");
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error deleting product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      maquillaje: "Maquillaje",
      skincare: "Skincare",
      accesorios: "Accesorios"
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      maquillaje: "bg-pink-100 text-pink-800",
      skincare: "bg-green-100 text-green-800",
      accesorios: "bg-purple-100 text-purple-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-primary"></div>
      </div>
    );
  }

  // Show nothing if not authenticated (redirect is in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  if (productsLoading) {
    return (
      <div className="py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="w-16 h-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/6" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Admin Content */}
          <div className="p-8">
            {/* Mobile-Responsive Tabs */}
            <div className="flex flex-col sm:flex-row gap-1 mb-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 sm:p-1">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'products'
                    ? 'bg-white dark:bg-gray-600 text-pink-primary dark:text-pink-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <i className="fas fa-box mr-1 sm:mr-2"></i>
                Productos
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-white dark:bg-gray-600 text-pink-primary dark:text-pink-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <i className="fas fa-tags mr-1 sm:mr-2"></i>
                Categorías
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'content'
                    ? 'bg-white dark:bg-gray-600 text-pink-primary dark:text-pink-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <i className="fas fa-edit mr-1 sm:mr-2"></i>
                Contenido
              </button>
            </div>

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Gestión de Productos</h2>
                  <p className="text-gray-600 dark:text-gray-300">Administra tu catálogo de productos de belleza</p>
                </div>
            
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Add Product Card */}
                  <Card 
                    className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-dashed border-pink-200 dark:border-pink-700 hover:border-pink-300 dark:hover:border-pink-600 transition-colors cursor-pointer group"
                    onClick={() => setShowProductForm(true)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[300px]">
                      <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-800/40 transition-colors">
                        <i className="fas fa-plus text-pink-600 dark:text-pink-400 text-2xl"></i>
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Agregar Producto
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Haz clic para crear un nuevo producto en tu catálogo
                      </p>
                    </CardContent>
                  </Card>

                  {/* Existing Products */}
                  {products?.map((product) => (
                      <Card key={product.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3">
                            {product.imageUrl ? (
                              <img
                                className="w-full h-full object-cover"
                                src={product.imageUrl}
                                alt={product.name}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="fas fa-image text-gray-400 text-3xl"></i>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <CardTitle className="text-lg font-serif text-gray-900 dark:text-white line-clamp-1">
                              {product.name}
                            </CardTitle>
                            <div className="flex items-center justify-between">
                              <Badge className={getCategoryColor(product.category)}>
                                {getCategoryLabel(product.category)}
                              </Badge>
                              <Badge variant={product.isActive ? "default" : "secondary"}>
                                {product.isActive ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              ₡{product.price.toLocaleString()}
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                className="flex-1"
                              >
                                <i className="fas fa-edit mr-1"></i>
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct(product)}
                                className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              >
                                <i className="fas fa-trash mr-1"></i>
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <CategoriesManager />
            )}

            {activeTab === 'content' && (
              <CmsManager defaultActiveSection="hero" />
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      <Dialog open={showProductForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingProduct ? "Editar Producto" : "Agregar Producto"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={editingProduct} 
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar "{productToDelete?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setProductToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
