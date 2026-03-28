import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/models";
import CategoryForm from "./category-form";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import { listCategories, deleteCategory } from "@/services/categoriesApi";

export default function CategoriesManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories using the Orders API
  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ['categories', defaultOrg?.id],
    queryFn: () => listCategories(defaultOrg!.id, 1, 100), // Fetch all categories
    enabled: !!defaultOrg?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = categoriesResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!defaultOrg?.id) throw new Error("Missing organization");
      return await deleteCategory(defaultOrg.id, categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: t('categories.deleted'),
        description: t('categories.deletedDescription'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    if (confirm(t('categories.deleteConfirm').replace('{name}', category.name))) {
      deleteMutation.mutate(category.categoryId);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

  if (isLoading) {
    return <div className="p-6">{t('categories.loading')}</div>;
  }

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("categories.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("categories.clearSearch")}</span>
          </Button>
        )}
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-folder-open text-muted-foreground text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('categories.empty')}</h3>
                <p className="text-muted-foreground">{t('categories.emptyDescription')}</p>
              </div>
              <Button onClick={handleCreateCategory}>
                {t('categories.createFirst')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="text-muted-foreground w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('categories.noResults')}</h3>
                <p className="text-muted-foreground">{t('categories.noResultsDescription')}</p>
              </div>
              <Button variant="outline" onClick={handleClearSearch}>
                {t('categories.clearSearch')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Category Card */}
          <Card 
            className="overflow-hidden border-2 border-dashed border-border hover:border-primary cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={handleCreateCategory}
          >
            <CardContent className="flex items-center justify-center min-h-[280px] p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-plus text-primary text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t('categories.new')}</h3>
                  <p className="text-muted-foreground text-sm">{t('categories.newDescription')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Categories */}
          {filteredCategories.map((category: Category) => (
            <Card key={category.categoryId} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div 
                className="h-24 p-4 flex items-center justify-between"
                style={{ backgroundColor: category.backgroundColor }}
              >
                <h3 
                  className="text-lg font-bold"
                  style={{ 
                    color: category.backgroundColor.includes('f') || category.backgroundColor.includes('e') ? '#1a1a1a' : '#ffffff'
                  }}
                >
                  {category.name}
                </h3>
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🍓</span>
                </div>
              </div>
              
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-muted-foreground">
                    <span>{t('categories.slug')}: {category.slug}</span>
                    <span>•</span>
                    <span>{t('categories.order')}: {category.sortOrder}</span>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: category.backgroundColor }}
                      title={t('categories.backgroundColor')}
                    ></div>
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: category.buttonColor }}
                      title={t('categories.buttonColor')}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <i className="fas fa-edit mr-1"></i>
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={deleteMutation.isPending}
                  >
                    <i className="fas fa-trash mr-1"></i>
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t('categories.edit') : t('categories.new')}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}