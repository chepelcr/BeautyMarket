import {useState, useEffect} from "react";
import { PageLoader } from "@/components/ui/page-loader";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import ProductForm from "@/components/admin/product-form";
import CategoriesManager from "@/components/admin/categories-manager";
import {CmsManager} from "@/components/admin/cms-manager";
import OrganizationSettingsManager from "@/components/admin/organization-settings-manager";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import type {Product, Category} from "@/models";
import {apiRequest} from "@/lib/queryClient";
import {queryClient} from "@/lib/queryClient";
import {useToast} from "@/hooks/use-toast";
import {useAuth} from "@/hooks/useAuth";
import {useOrganization} from "@/hooks/useOrganization";
import {useLocation} from "wouter";
import {isUnauthorizedError} from "@/lib/authUtils";
import {useDynamicTitle} from "@/hooks/useDynamicTitle";
import {buildOrgApiUrl} from "@/lib/apiUtils";

export default function Admin() {
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'content' | 'organization'>('products');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const {toast} = useToast();
    const {isAuthenticated, isLoading, user} = useAuth();
    const { useDefaultOrganization } = useOrganization();
    const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
    const [, navigate] = useLocation();

    const organizationId = organization?.id;

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
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !user?.id || !organizationId || orgLoading) {
            console.log('Skipping data load:', { isAuthenticated, userId: user?.id, organizationId, orgLoading });
            return;
        }

        const loadData = async () => {
            try {
                console.log('Loading data for org:', organizationId);
                const { listCategories } = await import('@/services/categoriesApi');
                const [productsRes, categoriesRes] = await Promise.all([
                    apiRequest('GET', buildOrgApiUrl(user.id, organizationId, '/products')),
                    listCategories(organizationId, 1, 100)
                ]);

                if (!productsRes.ok) {
                    throw new Error(`API error: ${productsRes.status}`);
                }

                setProducts(await productsRes.json());
                setCategories(categoriesRes.data);
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
                console.error('Failed to load data:', error);
                toast({
                    title: "Error loading data",
                    description: "Failed to load products and categories",
                    variant: "destructive",
                });
            } finally {
                setProductsLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, user?.id, organizationId, orgLoading, toast, navigate]);

    const handleDeleteProduct = (product: Product) => {
        setProductToDelete(product);
        setShowDeleteDialog(true);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete || !user?.id || !organizationId) return;

        try {
            await apiRequest("DELETE", buildOrgApiUrl(user.id, organizationId, `/products/${productToDelete.id}`));
            queryClient.invalidateQueries({queryKey: ["products"]});
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

    const getCategoryLabel = (categoryId: string) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category?.name || "Sin categoría";
    };

    const getCategoryColor = (categoryId: string) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category?.backgroundColor || "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    };

    // Show loading while checking authentication or organization
    if (isLoading || orgLoading) {
        return <PageLoader />;
    }

    // Show nothing if not authenticated (redirect is in useEffect)
    if (!isAuthenticated) {
        return null;
    }

    // Show nothing if no organization (redirect is in useEffect)
    if (!organization || !organizationId) {
        return null;
    }

    if (productsLoading) {
        return (
            <div className="py-8 bg-background min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-card rounded-3xl shadow-xl overflow-hidden">
                        <div className="p-8">
                            <div className="space-y-4">
                                {Array.from({length: 5}).map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                        <Skeleton className="w-16 h-16"/>
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/4"/>
                                            <Skeleton className="h-3 w-1/6"/>
                                        </div>
                                        <Skeleton className="h-8 w-20"/>
                                        <Skeleton className="h-8 w-16"/>
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
        <div className="py-8 bg-background min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-card rounded-3xl shadow-xl overflow-hidden">
                    {/* Admin Content */}
                    <div className="p-8">
                        {/* Mobile-Responsive Tabs */}
                        <div
                            className="flex flex-col sm:flex-row gap-1 mb-8 bg-muted rounded-lg p-2 sm:p-1">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'products'
                                        ? 'bg-background text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <i className="fas fa-box mr-1 sm:mr-2"></i>
                                Productos
                            </button>
                            <button
                                onClick={() => setActiveTab('categories')}
                                className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'categories'
                                        ? 'bg-background text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <i className="fas fa-tags mr-1 sm:mr-2"></i>
                                Categorías
                            </button>
                            <button
                                onClick={() => setActiveTab('content')}
                                className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'content'
                                        ? 'bg-background text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <i className="fas fa-edit mr-1 sm:mr-2"></i>
                                Contenido
                            </button>
                            <button
                                onClick={() => setActiveTab('organization')}
                                className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'organization'
                                        ? 'bg-background text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <i className="fas fa-building mr-1 sm:mr-2"></i>
                                Organización
                            </button>
                        </div>

                        {activeTab === 'products' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Gestión
                                        de Productos</h2>
                                    <p className="text-gray-600 dark:text-gray-300">Administra tu catálogo de productos</p>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {/* Add Product Card */}
                                    <Card
                                        className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-dashed border-pink-200 dark:border-pink-700 hover:border-pink-300 dark:hover:border-pink-600 transition-colors cursor-pointer group"
                                        onClick={() => setShowProductForm(true)}
                                    >
                                        <CardContent
                                            className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[300px]">
                                            <div
                                                className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-800/40 transition-colors">
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
                                        <Card key={product.product_id}
                                              className="bg-card border border-border hover:shadow-lg transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div
                                                    className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                                                    {product.image_url ? (
                                                        <img
                                                            className="w-full h-full object-cover"
                                                            src={product.image_url}
                                                            alt={product.name}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <i className="fas fa-image text-gray-400 text-3xl"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <CardTitle
                                                        className="text-lg font-serif text-gray-900 dark:text-white line-clamp-1">
                                                        {product.name}
                                                    </CardTitle>
                                                    <div className="flex items-center justify-between">
                                                        <Badge className={getCategoryColor(product.category_id)}>
                                                            {getCategoryLabel(product.category_id)}
                                                        </Badge>
                                                        <Badge variant={product.status === 1 ? "default" : "secondary"}>
                                                            {product.status === 1 ? "Activo" : "Inactivo"}
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
                            <CategoriesManager/>
                        )}

                        {activeTab === 'content' && (
                            <CmsManager defaultActiveSection="hero"/>
                        )}

                        {activeTab === 'organization' && user?.id && organizationId && (
                            <OrganizationSettingsManager
                                userId={user.id}
                                organizationId={organizationId}
                            />
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
                        categories={categories}
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
                            ¿Estás seguro de que quieres eliminar "{productToDelete?.name}"? Esta acción no se puede
                            deshacer.
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
