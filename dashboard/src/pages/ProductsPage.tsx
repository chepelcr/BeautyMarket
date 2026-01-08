import { useState, useEffect } from 'react';
import { Plus, PackageSearch, ArrowUpDown } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductListStore } from '@/store/product-list-store';
import { ProductSearch } from '@/components/products/ProductSearch';
import { ProductFilters } from '@/components/products/ProductFilters';
import { BulkActions } from '@/components/products/BulkActions';
import { ProductCard } from '@/components/products/ProductCard';
import { Pagination } from '@/components/products/Pagination';
import ProductForm from '@/components/admin/product-form';
import { apiRequest } from '@/lib/queryClient';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Product, Category } from '@/models';

export default function ProductsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Get organization from localStorage
  const [organization, setOrganization] = useState<any>(null);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    const storedOrg = localStorage.getItem('selectedOrganization');
    if (storedOrg) {
      try {
        setOrganization(JSON.parse(storedOrg));
      } catch (error) {
        console.error('Failed to parse organization:', error);
        navigate('/organizations/select');
      }
    } else if (!authLoading && isAuthenticated) {
      navigate('/organizations/select');
    }
    setOrgLoading(false);
  }, [authLoading, isAuthenticated, navigate]);

  const organizationId = organization?.id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Product list store
  const {
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize,
    selectedProductIds,
    setPage,
    setPageSize,
    setSorting,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  } = useProductListStore();

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch products
  const {
    products,
    total,
    totalPages,
    isLoading: productsLoading,
    activateProducts,
    deactivateProducts,
    deleteProducts,
    isActivating,
    isDeactivating,
    isDeleting,
  } = useProducts({
    userId: user?.id || '',
    orgId: organizationId || '',
    search: debouncedSearch,
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  // Fetch categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !organizationId) return;

    const loadCategories = async () => {
      try {
        const response = await apiRequest(
          'GET',
          buildOrgApiUrl(user.id, organizationId, '/categories')
        );
        if (response.ok) {
          setCategories(await response.json());
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [user?.id, organizationId]);

  // Product form dialog
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete || !user?.id || !organizationId) return;

    try {
      await apiRequest(
        'DELETE',
        buildOrgApiUrl(user.id, organizationId, `/products/${productToDelete.id}`)
      );
      toast({
        title: t('products.toast.deleted.title'),
        description: t('products.toast.deleted.description'),
      });
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (error) {
      toast({
        title: t('products.toast.deleteFailed.title'),
        description: t('products.toast.deleteFailed.description'),
        variant: 'destructive',
      });
      console.error('Error deleting product:', error);
    }
  };

  // Bulk actions
  const handleBulkActivate = async () => {
    try {
      await activateProducts(Array.from(selectedProductIds));
      toast({
        title: t('products.toast.activated.title'),
        description: t('products.toast.activated.description').replace('{count}', String(selectedProductIds.size)),
      });
      clearSelection();
    } catch (error) {
      toast({
        title: t('products.toast.activateFailed.title'),
        description: t('products.toast.activateFailed.description'),
        variant: 'destructive',
      });
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await deactivateProducts(Array.from(selectedProductIds));
      toast({
        title: t('products.toast.deactivated.title'),
        description: t('products.toast.deactivated.description').replace('{count}', String(selectedProductIds.size)),
      });
      clearSelection();
    } catch (error) {
      toast({
        title: t('products.toast.deactivateFailed.title'),
        description: t('products.toast.deactivateFailed.description'),
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteProducts(Array.from(selectedProductIds));
      toast({
        title: t('products.toast.bulkDeleted.title'),
        description: t('products.toast.bulkDeleted.description').replace('{count}', String(selectedProductIds.size)),
      });
      clearSelection();
    } catch (error) {
      toast({
        title: t('products.toast.bulkDeleteFailed.title'),
        description: t('products.toast.bulkDeleteFailed.description'),
        variant: 'destructive',
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedProductIds.size === products.length) {
      clearSelection();
    } else {
      selectAll(products.map((p) => p.id));
    }
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [
      'name' | 'price' | 'createdAt',
      'asc' | 'desc'
    ];
    setSorting(newSortBy, newSortOrder);
  };

  // Loading states
  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !organization || !organizationId) {
    return null;
  }

  const isLoading = productsLoading || categoriesLoading;
  const isBulkActionLoading = isActivating || isDeactivating || isDeleting;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('products.title')}</h1>
          <p className="text-muted-foreground">
            {t('products.subtitle')}
          </p>
        </div>
        <Button onClick={handleAddProduct} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          {t('products.addProduct')}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <ProductSearch />
        <div className="flex items-center gap-2 flex-wrap">
          <ProductFilters categories={categories} />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">{t('products.sort')}</span>
          </div>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">{t('products.sort.newestFirst')}</SelectItem>
              <SelectItem value="createdAt-asc">{t('products.sort.oldestFirst')}</SelectItem>
              <SelectItem value="name-asc">{t('products.sort.nameAsc')}</SelectItem>
              <SelectItem value="name-desc">{t('products.sort.nameDesc')}</SelectItem>
              <SelectItem value="price-asc">{t('products.sort.priceAsc')}</SelectItem>
              <SelectItem value="price-desc">{t('products.sort.priceDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedProductIds.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedProductIds.size === products.length
                ? t('products.deselectAll')
                : t('products.selectAll')}
            </Button>
            <BulkActions
              selectedCount={selectedProductIds.size}
              onActivate={handleBulkActivate}
              onDeactivate={handleBulkDeactivate}
              onDelete={handleBulkDelete}
              isLoading={isBulkActionLoading}
            />
          </div>
        </div>
      )}

      {/* Products grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {debouncedSearch || Object.keys(filters).length > 0
              ? t('products.noProductsFound')
              : t('products.noProductsYet')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {debouncedSearch || Object.keys(filters).length > 0
              ? t('products.noProductsFoundDescription')
              : t('products.noProductsYetDescription')}
          </p>
          {!debouncedSearch && Object.keys(filters).length === 0 && (
            <Button onClick={handleAddProduct}>
              <Plus className="h-5 w-5 mr-2" />
              {t('products.addProduct')}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                isSelected={isSelected(product.id)}
                onToggleSelection={() => toggleSelection(product.id)}
                onEdit={() => handleEditProduct(product)}
                onDelete={() => handleDeleteProduct(product)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProduct ? t('products.editProduct') : t('products.addProduct')}
            </DialogTitle>
          </DialogHeader>
          <ProductForm product={editingProduct} onSuccess={handleCloseForm} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('products.delete.description').replace('{name}', productToDelete?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setProductToDelete(null);
              }}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
