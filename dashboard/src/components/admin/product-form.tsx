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
  categories: Category[];
  categoriesLoading?: boolean;
  onSuccess: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export default function ProductForm({ 
  product, 
  categories, 
  categoriesLoading = false,
  onSuccess, 
  onSubmittingChange 
}: ProductFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  const { t } = useLanguage();
  
  // Track if this is a new product (insert mode)
  const isInsertMode = !product;
  
  // Track CABYS selection state
  const [hasCabysSelected, setHasCabysSelected] = useState(!!product?.cabys);

  // Extract SKU from codes array (code type 03) and filter it out from codes
  const extractSkuFromCodes = (codes?: any[]) => {
    if (!codes || codes.length === 0) return { sku: "", filteredCodes: [] };
    
    const skuCode = codes.find(code => code.codeTypeId === "03");
    const filteredCodes = codes.filter(code => code.codeTypeId !== "03");
    
    return {
      sku: skuCode?.number || "",
      filteredCodes
    };
  };

  const { sku: extractedSku, filteredCodes } = extractSkuFromCodes(product?.codes);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      categoryId: product?.categoryId || product?.category?.categoryId || "",
      imageUrl: product?.imageUrl || "",
      isActive: product?.isActive ?? true,
      sku: extractedSku || product?.sku || "",
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
      codes: filteredCodes,
      discounts: product?.discounts || [],
      taxes: product?.taxes || [],
      baseAmount: product?.baseAmount || 0,
      salePrice: product?.salePrice || 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProduct) => {
      onSubmittingChange?.(true);
      if (!user?.id || !defaultOrg?.id) throw new Error("Missing user or organization context");
      return apiRequest("POST", buildOrgApiUrl(user.id, defaultOrg.id, "/products"), data);
    },
    onSuccess: () => {
      onSubmittingChange?.(false);
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
      onSubmittingChange?.(false);
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
      onSubmittingChange?.(true);
      if (!user?.id || !defaultOrg?.id) throw new Error("Missing user or organization context");
      return apiRequest("PUT", buildOrgApiUrl(user.id, defaultOrg.id, `/products/${product?.id}`), data);
    },
    onSuccess: () => {
      onSubmittingChange?.(false);
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
      onSubmittingChange?.(false);
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
    // Handle SKU as code type 03 (Manufacturer/Barcode)
    const sku = data.sku;
    const codes = data.codes || [];
    
    // Remove any existing code type 03 from codes array
    const filteredCodes = codes.filter(code => code.codeTypeId !== "03");
    
    // If SKU is provided, add it as code type 03
    if (sku && sku.trim()) {
      filteredCodes.push({
        codeTypeId: "03",
        number: sku.trim(),
        description: "Código del producto asignado por el fabricante"
      });
    }
    
    // Update the data with the modified codes array
    const submissionData = {
      ...data,
      codes: filteredCodes.length > 0 ? filteredCodes : undefined
    };
    
    // Remove sku from submission data as it's now in codes
    delete submissionData.sku;
    
    if (product) {
      updateMutation.mutate(submissionData);
    } else {
      createMutation.mutate(submissionData);
    }
  };
  
  // Watch CABYS field to enable/disable sections
  const cabysValue = form.watch("cabys");
  const codesValue = form.watch("codes") || [];
  const discountsValue = form.watch("discounts") || [];
  const taxesValue = form.watch("taxes") || [];
  
  // Update hasCabysSelected when CABYS changes
  useState(() => {
    if (cabysValue && cabysValue.length > 0) {
      setHasCabysSelected(true);
    } else if (isInsertMode) {
      setHasCabysSelected(false);
    }
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FiscalInformationSection 
          form={form} 
          isInsertMode={isInsertMode}
          hasCabysSelected={hasCabysSelected}
          onCabysSelect={() => setHasCabysSelected(true)}
          onCabysClear={() => setHasCabysSelected(false)}
        />
        
        <GeneralInfoSection 
          form={form} 
          categories={categories} 
          categoriesLoading={categoriesLoading}
          disabled={isInsertMode && !hasCabysSelected}
        />
        
        <PackagingSection 
          form={form}
          disabled={isInsertMode && !hasCabysSelected}
        />
        
        <CustomsSection 
          form={form}
          disabled={isInsertMode && !hasCabysSelected}
        />
        
        <CodesSection 
          form={form}
          disabled={isInsertMode && !hasCabysSelected}
          forceCollapsed={isInsertMode && codesValue.length === 0}
        />
        
        <InventorySection 
          form={form}
          disabled={isInsertMode && !hasCabysSelected}
        />
        
        <DiscountsSection 
          form={form}
          disabled={isInsertMode && !hasCabysSelected}
          forceCollapsed={isInsertMode && discountsValue.length === 0}
        />
        
        <AdvancedTaxesSection 
          form={form}
          disabled={isInsertMode && !hasCabysSelected}
          forceCollapsed={isInsertMode && taxesValue.length === 0}
        />
        
        <CommercialValueSection 
          form={form}
          disabled={isInsertMode && !hasCabysSelected}
        />

        <ImageUpload
          value={form.watch("imageUrl") || ""}
          onChange={(url) => form.setValue("imageUrl", url)}
          label={t("products.form.image")}
          folder="images/products"
        />
      </form>
    </Form>
  );
}
