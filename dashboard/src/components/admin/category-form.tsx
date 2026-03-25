import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema, type InsertCategory, type Category, type ImageDTO } from "@/models";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import { createCategory, updateCategory, fileToBase64, validateImage } from "@/services/categoriesApi";

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Helper function to generate contrasting button color
function getContrastingColor(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark or light color based on luminance
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

// Form data type (for local state)
interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  backgroundColor: string;
  buttonColor: string;
  image1File?: File;
  image2File?: File;
  sortOrder: number;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(false);
  const [image1Preview, setImage1Preview] = useState<string | null>(category?.image1Url || null);
  const [image2Preview, setImage2Preview] = useState<string | null>(category?.image2Url || null);
  const image1InputRef = useRef<HTMLInputElement>(null);
  const image2InputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!category;
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: category ? {
      name: category.name,
      slug: category.slug,
      description: category.description,
      backgroundColor: category.backgroundColor,
      buttonColor: category.buttonColor,
      sortOrder: category.sortOrder,
    } : {
      name: "",
      slug: "",
      description: "",
      backgroundColor: "#fce7f3",
      buttonColor: "#e91e63",
      sortOrder: 0,
    },
  });

  const watchedValues = watch();

  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
    setValue('slug', slug);
  };

  // Auto-generate button color when background color changes
  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bgColor = e.target.value;
    const buttonColor = getContrastingColor(bgColor);
    setValue('buttonColor', buttonColor);
  };

  // Handle image file selection
  const handleImage1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast({
        title: t("categories.form.error"),
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImage1Preview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImage2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast({
        title: t("categories.form.error"),
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImage2Preview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (!defaultOrg?.id) throw new Error("Missing organization");

      // Prepare the request payload
      const payload: InsertCategory = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        backgroundColor: data.backgroundColor,
        buttonColor: data.buttonColor,
        sortOrder: data.sortOrder,
      };

      // Add image1 if file is selected
      if (image1InputRef.current?.files?.[0]) {
        const file = image1InputRef.current.files[0];
        const base64 = await fileToBase64(file);
        payload.image1 = {
          data: base64,
          name: file.name,
          contentType: file.type,
        };
      }

      // Add image2 if file is selected
      if (image2InputRef.current?.files?.[0]) {
        const file = image2InputRef.current.files[0];
        const base64 = await fileToBase64(file);
        payload.image2 = {
          data: base64,
          name: file.name,
          contentType: file.type,
        };
      }

      if (isEditing) {
        return await updateCategory(defaultOrg.id, category!.categoryId, payload);
      } else {
        return await createCategory(defaultOrg.id, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      const titleKey = isEditing ? "categories.form.updateSuccess" : "categories.form.createSuccess";
      const action = isEditing ? 'actualizada' : 'creada';
      toast({
        title: t(titleKey),
        description: t("categories.form.successDesc", { name: watchedValues.name, action }),
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: t("categories.form.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    mutation.mutate(data);
  };

  const CategoryPreview = () => (
    <Card 
      className="rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300"
      style={{ backgroundColor: watchedValues.backgroundColor }}
    >
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                {watchedValues.name || t("categories.form.previewCard.name")}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {watchedValues.description || t("categories.form.previewCard.description")}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🍓</span>
            </div>
          </div>

          {/* Images */}
          <div className="flex space-x-4">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
              {image1Preview ? (
                <img 
                  src={image1Preview} 
                  alt="Imagen 1" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-2xl">📷</span>
              )}
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
              {image2Preview ? (
                <img 
                  src={image2Preview} 
                  alt="Imagen 2" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-2xl">📷</span>
              )}
            </div>
          </div>

          {/* Button */}
          <Button
            className="w-full py-3 rounded-xl font-medium transition-colors"
            style={{
              backgroundColor: watchedValues.buttonColor || "#e91e63",
              color: getContrastingColor(watchedValues.buttonColor || "#e91e63")
            }}
          >
            {t("categories.form.previewCard.button")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">
          {t(isEditing ? 'categories.form.title.edit' : 'categories.form.title.new')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {t(showPreview ? 'categories.form.preview.hide' : 'categories.form.preview.show')} {t("categories.form.preview.title")}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("categories.form.cardTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("categories.form.name")} *</Label>
                <Input
                  id="name"
                  {...register("name", { onChange: handleNameChange })}
                  placeholder={t("categories.form.namePlaceholder")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">{t("categories.form.slug")} *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder={t("categories.form.slugPlaceholder")}
                  disabled
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">{t("categories.form.description")} *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder={t("categories.form.descriptionPlaceholder")}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">{t("categories.form.backgroundColor")} *</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    {...register("backgroundColor", { onChange: handleBackgroundColorChange })}
                  />
                  {errors.backgroundColor && (
                    <p className="text-sm text-red-600">{errors.backgroundColor.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="buttonColor">{t("categories.form.buttonColor")} *</Label>
                  <Input
                    id="buttonColor"
                    type="color"
                    {...register("buttonColor")}
                  />
                  {errors.buttonColor && (
                    <p className="text-sm text-red-600">{errors.buttonColor.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image1">{t("categories.form.image1")}</Label>
                  <Input
                    id="image1"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    ref={image1InputRef}
                    onChange={handleImage1Change}
                  />
                  {image1Preview && (
                    <div className="mt-2">
                      <img 
                        src={image1Preview} 
                        alt="Preview 1" 
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB. PNG, JPEG, GIF, WEBP
                  </p>
                </div>

                <div>
                  <Label htmlFor="image2">{t("categories.form.image2")}</Label>
                  <Input
                    id="image2"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    ref={image2InputRef}
                    onChange={handleImage2Change}
                  />
                  {image2Preview && (
                    <div className="mt-2">
                      <img 
                        src={image2Preview} 
                        alt="Preview 2" 
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB. PNG, JPEG, GIF, WEBP
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="sortOrder">{t("categories.form.sortOrder")}</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...register("sortOrder", { valueAsNumber: true })}
                  placeholder={t("categories.form.sortOrderPlaceholder")}
                />
                {errors.sortOrder && (
                  <p className="text-sm text-red-600">{errors.sortOrder.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1"
                >
                  {mutation.isPending
                    ? t(isEditing ? 'categories.form.updating' : 'categories.form.creating')
                    : t(isEditing ? 'categories.form.update' : 'categories.form.create')
                  }
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    {t("categories.form.cancel")}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("categories.form.preview.title")} del Card</h3>
            <CategoryPreview />
          </div>
        )}
      </div>
    </div>
  );
}