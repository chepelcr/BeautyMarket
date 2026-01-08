import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "@/components/image-upload";
import {
  insertProductSchema,
  type Product,
  type InsertProduct,
  type Category,
} from "@/models";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  const { t } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !defaultOrg?.id) return;

    const loadCategories = async () => {
      try {
        const response = await apiRequest("GET", buildOrgApiUrl(user.id, defaultOrg.id, "/categories"));
        setCategories(await response.json());
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [user?.id, defaultOrg?.id]);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      categoryId: product?.categoryId || "",
      imageUrl: product?.imageUrl || "",
      isActive: product?.isActive ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProduct) => {
      if (!user?.id || !defaultOrg?.id) throw new Error("Missing user or organization context");
      return apiRequest("POST", buildOrgApiUrl(user.id, defaultOrg.id, "/products"), data);
    },
    onSuccess: () => {
      // Invalidate multiple related queries to ensure all data is fresh
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: t("products.form.createSuccess"),
        description: t("products.form.createSuccessDesc"),
      });
      onSuccess();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("products.form.unauthorized"),
          description: t("products.form.unauthorizedDesc"),
          variant: "destructive",
        });
        setTimeout(() => {
          navigate("/login");
        }, 500);
        return;
      }
      toast({
        title: t("products.form.error"),
        description: error.message || t("products.form.createError"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertProduct) => {
      if (!user?.id || !defaultOrg?.id) throw new Error("Missing user or organization context");
      return apiRequest("PUT", buildOrgApiUrl(user.id, defaultOrg.id, `/products/${product?.id}`), data);
    },
    onSuccess: () => {
      // Invalidate multiple related queries to ensure all data is fresh
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: t("products.form.updateSuccess"),
        description: t("products.form.updateSuccessDesc"),
      });
      onSuccess();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("products.form.unauthorized"),
          description: t("products.form.unauthorizedDesc"),
          variant: "destructive",
        });
        setTimeout(() => {
          navigate("/login");
        }, 500);
        return;
      }
      toast({
        title: t("products.form.error"),
        description: error.message || t("products.form.updateError"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProduct) => {
    if (product) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("products.form.name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("products.form.namePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("products.form.price")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("products.form.pricePlaceholder")}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("products.form.category")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("products.form.categoryPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      {t("products.form.loadingCategories")}
                    </SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {t("products.form.noCategories")}
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("products.form.description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("products.form.descriptionPlaceholder")}
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  value={field.value || ""}
                  onChange={field.onChange}
                  label={t("products.form.image")}
                  folder="images/products"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            {t("products.form.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-pink-primary hover:bg-pink-600"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {t("products.form.saving")}
              </>
            ) : product ? (
              t("products.form.update")
            ) : (
              t("products.form.create")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
