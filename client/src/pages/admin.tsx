import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "@/components/admin/product-form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/products/${productId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
      });
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
        description: "Error al eliminar el producto",
        variant: "destructive",
      });
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
      <div className="py-20 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-pink-primary to-coral p-8 flex justify-between items-center">
              <div>
                <h1 className="font-serif text-3xl font-bold text-white mb-2">Panel de Administración</h1>
                <p className="text-pink-100">Gestiona tus productos y categorías</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => window.location.href = "/api/logout"}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-pink-primary"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
            
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
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Admin Header */}
          <div className="bg-gradient-to-r from-pink-primary to-coral p-8 flex justify-between items-center">
            <div>
              <h1 className="font-serif text-3xl font-bold text-white mb-2">Panel de Administración</h1>
              <p className="text-pink-100">Gestiona tus productos y categorías</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-pink-100">Hola, {user?.username}</span>
              <Button
                onClick={async () => {
                  try {
                    await apiRequest("POST", "/api/logout");
                    queryClient.setQueryData(["/api/user"], null);
                    navigate("/login");
                  } catch (error) {
                    console.error("Logout error:", error);
                  }
                }}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-pink-primary"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
          
          {/* Admin Content */}
          <div className="p-8">
            {/* Tabs */}
            <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'products'
                    ? 'bg-white text-pink-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="fas fa-box mr-2"></i>
                Productos
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-white text-pink-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="fas fa-tags mr-2"></i>
                Categorías
              </button>
            </div>

            {activeTab === 'products' && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-serif text-2xl font-semibold text-gray-900">Gestión de Productos</h2>
                  <Button 
                    onClick={() => setShowProductForm(true)}
                    className="bg-pink-primary hover:bg-pink-600 text-white"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Agregar Producto
                  </Button>
                </div>
            
            {/* Products Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Lista de Productos</h3>
              </div>
              
              {products && products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-box-open text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">
                    No hay productos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza agregando tu primer producto al catálogo.
                  </p>
                  <Button 
                    onClick={() => setShowProductForm(true)}
                    className="bg-pink-primary hover:bg-pink-600 text-white"
                  >
                    Agregar Producto
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products?.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16">
                                {product.imageUrl ? (
                                  <img
                                    className="h-16 w-16 rounded-lg object-cover"
                                    src={product.imageUrl}
                                    alt={product.name}
                                  />
                                ) : (
                                  <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <i className="fas fa-image text-gray-400"></i>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getCategoryColor(product.category)}>
                              {getCategoryLabel(product.category)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              ₡{product.price.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            </>
            )}

            {activeTab === 'categories' && (
              <div>
                <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-6">Gestión de Categorías</h2>
                <p className="text-gray-600 mb-8">Administra las categorías de productos y personaliza su apariencia</p>
                
                <div className="bg-gray-100 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-tags text-pink-primary text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sistema de Categorías Dinámicas</h3>
                  <p className="text-gray-600 mb-4">
                    Las categorías ahora son administrables desde la base de datos con colores personalizables y dos imágenes por categoría.
                  </p>
                  <div className="text-sm text-gray-500">
                    En desarrollo... 🚧
                  </div>
                </div>
              </div>
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
    </div>
  );
}
