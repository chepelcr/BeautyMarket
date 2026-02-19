import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/image-upload";
import { FiscalInformationSection } from "@/components/products/sections/FiscalInformationSection";
import { GeneralInfoSection } from "@/components/products/sections/GeneralInfoSection";
import { CodesSection } from "@/components/products/sections/CodesSection";
import { PackagingSection } from "@/components/products/sections/PackagingSection";
import { CustomsSection } from "@/components/products/sections/CustomsSection";
import { InventorySection } from "@/components/products/sections/InventorySection";
import { DiscountsSection } from "@/components/products/sections/DiscountsSection";
import { AdvancedTaxesSection } from "@/components/products/sections/AdvancedTaxesSection";
import { CommercialValueSection } from "@/components/products/sections/CommercialValueSection";
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
      sku: product?.sku || "",
      stockQuantity: product?.stockQuantity ?? 0,
      lowStockThreshold: product?.lowStockThreshold ?? 10,
      trackInventory: product?.trackInventory ?? true,
      internalCode: product?.internalCode || "",
      originalCode: product?.originalCode || "",
      clientArticleCode: product?.clientArticleCode || "",
      code: product?.code || "",
      unitsPerBox: product?.unitsPerBox || null,
      cabys: product?.cabys || "",
      cabysDescription: product?.cabysDescription || "",
      productTypeId: product?.productTypeId || 1,
      unitId: product?.unitId || 85,
      commercialUnitMeasure: product?.commercialUnitMeasure || "",
      isPackaged: product?.isPackaged || false,
      quantity: product?.quantity || 1,
      unitPrice: product?.unitPrice || 0,
      customsPart: product?.customsPart || "",
      codes: product?.codes || [],
      discounts: product?.discounts || [],
      taxes: product?.taxes || [],
      baseAmount: product?.baseAmount || 0,
      salePrice: product?.salePrice || 0,
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
        <FiscalInformationSection form={form} />
        
        <GeneralInfoSection form={form} categories={categories} categoriesLoading={categoriesLoading} />
        
        <PackagingSection form={form} />
        
        <CustomsSection form={form} />
        
        <CodesSection form={form} />
        
        <InventorySection form={form} />
        
        <DiscountsSection form={form} />
        
        <AdvancedTaxesSection form={form} />
        
        <CommercialValueSection form={form} />

        <ImageUpload
          value={form.watch("imageUrl") || ""}
          onChange={(url) => form.setValue("imageUrl", url)}
          label={t("products.form.image")}
          folder="images/products"
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
