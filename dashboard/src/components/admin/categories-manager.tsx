import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/models";
import CategoryForm from "./category-form";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CategoriesManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !defaultOrg?.id) return;

    const loadCategories = async () => {
      try {
        const response = await apiRequest('GET', buildOrgApiUrl(user.id, defaultOrg.id, '/categories'));
        setCategories(await response.json());
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [user?.id, defaultOrg?.id]);

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!user?.id || !defaultOrg?.id) throw new Error("Missing context");
      return await apiRequest("DELETE", buildOrgApiUrl(user.id, defaultOrg.id, `/categories/${categoryId}`));
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
      deleteMutation.mutate(category.id);
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

  return (
    <div className="space-y-6">

      {categories.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-folder-open text-gray-400 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('categories.empty')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('categories.emptyDescription')}</p>
              </div>
              <Button onClick={handleCreateCategory}>
                {t('categories.createFirst')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Category Card */}
          <Card 
            className="overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-pink-primary dark:hover:border-pink-400 cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={handleCreateCategory}
          >
            <CardContent className="flex items-center justify-center min-h-[280px] p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-plus text-pink-primary dark:text-pink-400 text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">{t('categories.new')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{t('categories.newDescription')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Categories */}
          {categories.map((category: Category) => (
            <Card key={category.id} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <div 
                className="h-24 p-4 flex items-center justify-between"
                style={{ backgroundColor: category.backgroundColor }}
              >
                <h3 
                  className="font-serif text-lg font-bold"
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
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                      className="flex-1"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteMutation.isPending}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
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