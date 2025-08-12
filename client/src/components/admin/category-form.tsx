import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema, type InsertCategory, type Category } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

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

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(false);
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: category || {
      name: "",
      slug: "",
      description: "",
      backgroundColor: "#fce7f3",
      buttonColor: "#e91e63",
      image1Url: "",
      image2Url: "",
      isActive: true,
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

  const mutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const url = isEditing ? `/api/categories/${category!.id}` : "/api/categories";
      const method = isEditing ? "PUT" : "POST";
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: isEditing ? "Categoría actualizada" : "Categoría creada",
        description: `La categoría "${watchedValues.name}" ha sido ${isEditing ? 'actualizada' : 'creada'} exitosamente.`,
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCategory) => {
    mutation.mutate(data);
  };

  const handleImageUpload = async (fieldName: 'image1Url' | 'image2Url') => {
    return {
      method: 'PUT' as const,
      url: await apiRequest('POST', '/api/objects/upload').then(res => res.json()).then(data => data.uploadURL),
    };
  };

  const handleUploadComplete = (fieldName: 'image1Url' | 'image2Url') => (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful[0]) {
      setValue(fieldName, result.successful[0].uploadURL as string);
    }
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
                {watchedValues.name || "Nombre de Categoría"}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {watchedValues.description || "Descripción de la categoría"}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🍓</span>
            </div>
          </div>

          {/* Images */}
          <div className="flex space-x-4">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
              {watchedValues.image1Url ? (
                <img 
                  src={watchedValues.image1Url} 
                  alt="Imagen 1" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-2xl">📷</span>
              )}
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
              {watchedValues.image2Url ? (
                <img 
                  src={watchedValues.image2Url} 
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
              backgroundColor: watchedValues.buttonColor,
              color: getContrastingColor(watchedValues.buttonColor)
            }}
          >
            Ver Productos
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">
          {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Ocultar' : 'Ver'} Vista Previa
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  {...register("name", { onChange: handleNameChange })}
                  placeholder="Ej: Maquillaje"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="maquillaje"
                  disabled
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Labiales, correctores y productos para realzar tu belleza natural"
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">Color de Fondo *</Label>
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
                  <Label htmlFor="buttonColor">Color del Botón *</Label>
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
                  <Label>Imagen 1</Label>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5242880} // 5MB
                    onGetUploadParameters={() => handleImageUpload('image1Url')}
                    onComplete={handleUploadComplete('image1Url')}
                    buttonClassName="w-full"
                  >
                    <span>Subir Imagen 1</span>
                  </ObjectUploader>
                  {watchedValues.image1Url && (
                    <p className="text-sm text-gray-500 mt-1">Imagen cargada</p>
                  )}
                </div>

                <div>
                  <Label>Imagen 2</Label>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5242880} // 5MB
                    onGetUploadParameters={() => handleImageUpload('image2Url')}
                    onComplete={handleUploadComplete('image2Url')}
                    buttonClassName="w-full"
                  >
                    <span>Subir Imagen 2</span>
                  </ObjectUploader>
                  {watchedValues.image2Url && (
                    <p className="text-sm text-gray-500 mt-1">Imagen cargada</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="sortOrder">Orden de Visualización</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...register("sortOrder", { valueAsNumber: true })}
                  placeholder="0"
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
                    ? (isEditing ? 'Actualizando...' : 'Creando...') 
                    : (isEditing ? 'Actualizar Categoría' : 'Crear Categoría')
                  }
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Vista Previa del Card</h3>
            <CategoryPreview />
          </div>
        )}
      </div>
    </div>
  );
}