import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { IvaTaxSection } from "./IvaTaxSection";
import { OtherTaxSection } from "./OtherTaxSection";
import { useState, useEffect } from "react";
import { getTaxConfig, TAX_TYPES } from "@/constants/taxTypes";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useAllTaxes, useAllTaxRates } from "@/hooks/useDataApi";

interface AdvancedTaxesSectionProps {
  form: any;
  disabled?: boolean;
  forceCollapsed?: boolean;
  isoCode?: string; // ISO code from organization context - when it changes, React Query automatically refetches
}

export function AdvancedTaxesSection({ form, disabled = false, forceCollapsed = false, isoCode = "CR" }: AdvancedTaxesSectionProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  
  const [taxAmountsData, setTaxAmountsData] = useState<{[taxTypeId: string]: any[]}>({});

  const taxes = form.watch("taxes") || [];
  const cabys = form.watch("cabys");
  const cabysDescription = form.watch("cabysDescription");
  const suggestedTaxRate = form.watch("taxes.0.rate") || 13;
  const baseAmount = form.watch("baseAmount") || 0;
  const subtotal = form.watch("price") || 0;

  // Fetch tax types from data API
  const { data: dataApiTaxTypes, isLoading: taxTypesLoading, isError: taxTypesError } = useAllTaxes(
    { iso_code: isoCode }
  );

  // Fallback to organization-specific API if data API fails
  const { data: orgTaxTypes } = useQuery<any[]>({
    queryKey: ["taxTypes", user?.id, defaultOrg?.id],
    queryFn: async (): Promise<any[]> => {
      if (!user?.id || !defaultOrg?.id) return [];
      const res = await apiRequest("GET", buildOrgApiUrl(user.id, defaultOrg.id, "/catalogs/tax-types"));
      return res.json();
    },
    enabled: taxTypesError && !!user?.id && !!defaultOrg?.id,
  });

  // Use data API data if available, otherwise fall back to org API data
  const taxTypes = dataApiTaxTypes || orgTaxTypes || [];

  // Fetch tax rates from data API
  const { data: dataApiTaxRates, isLoading: taxRatesLoading, isError: taxRatesError } = useAllTaxRates(
    { iso_code: isoCode }
  );

  // Fallback to organization-specific API if data API fails
  const { data: orgTaxRates } = useQuery<any[]>({
    queryKey: ["taxRates", user?.id, defaultOrg?.id],
    queryFn: async (): Promise<any[]> => {
      if (!user?.id || !defaultOrg?.id) return [];
      const res = await apiRequest("GET", buildOrgApiUrl(user.id, defaultOrg.id, "/catalogs/tax-rates"));
      return res.json();
    },
    enabled: taxRatesError && !!user?.id && !!defaultOrg?.id,
  });

  // Use data API data if available, otherwise fall back to org API data
  const taxRates = dataApiTaxRates || orgTaxRates || [];

  // Fetch tax factors
  const { data: taxFactors = [] } = useQuery<any[]>({
    queryKey: ["taxFactors", user?.id, defaultOrg?.id],
    queryFn: async (): Promise<any[]> => {
      if (!user?.id || !defaultOrg?.id) return [];
      const res = await apiRequest("GET", buildOrgApiUrl(user.id, defaultOrg.id, "/catalogs/tax-factors"));
      return res.json();
    },
    enabled: !!user?.id && !!defaultOrg?.id,
  });

  // Split taxes into IVA and other taxes
  const ivaTaxes = taxes.filter((t: any) => {
    const taxType = taxTypes.find((tt: any) => tt.id === t.taxTypeId);
    return taxType && [TAX_TYPES.IVA, TAX_TYPES.IVACE, TAX_TYPES.IVARBU].includes(taxType.code);
  });

  const otherTaxes = taxes.filter((t: any) => {
    const taxType = taxTypes.find((tt: any) => tt.id === t.taxTypeId);
    return !taxType || ![TAX_TYPES.IVA, TAX_TYPES.IVACE, TAX_TYPES.IVARBU].includes(taxType.code);
  });

  const handleIvaTaxesChange = (newIvaTaxes: any[]) => {
    form.setValue("taxes", [...newIvaTaxes, ...otherTaxes]);
  };

  const handleOtherTaxesChange = (newOtherTaxes: any[]) => {
    form.setValue("taxes", [...ivaTaxes, ...newOtherTaxes]);
  };

  const loadTaxAmounts = async (taxTypeId: string) => {
    if (taxAmountsData[taxTypeId] || !user?.id || !defaultOrg?.id) return;
    
    try {
      const res = await apiRequest("GET", buildOrgApiUrl(user.id, defaultOrg.id, `/catalogs/tax-amounts?taxTypeId=${taxTypeId}`));
      const amounts: any[] = await res.json();
      setTaxAmountsData(prev => ({ ...prev, [taxTypeId]: amounts }));
    } catch (error) {
      console.error('Error loading tax amounts:', error);
    }
  };

  const calculateTaxAmount = (tax: any) => {
    const taxType = taxTypes.find((t: any) => t.id === tax.taxTypeId);
    if (!taxType) return 0;

    const taxConfig = getTaxConfig(taxType.code);
    
    // IVA taxes (01, 07)
    if (taxType.code === TAX_TYPES.IVA || taxType.code === TAX_TYPES.IVACE) {
      return baseAmount * (tax.rate || 0) / 100;
    }
    
    // IVARBU (08)
    if (taxType.code === TAX_TYPES.IVARBU) {
      return (tax.rate || 0) * subtotal;
    }
    
    // IUC (03)
    if (taxType.code === TAX_TYPES.IUC) {
      const taxAmount = taxAmountsData[tax.taxTypeId]?.find((ta: any) => ta.id === tax.specialFields?.taxAmountId);
      return (taxAmount?.amount || 0) * (tax.specialFields?.quantity || 0);
    }
    
    // ISEBA (04)
    if (taxType.code === TAX_TYPES.ISEBA) {
      const proportion = (tax.specialFields?.quantity || 0) * (tax.specialFields?.percentage || 0) / 100;
      const taxAmount = taxAmountsData[tax.taxTypeId]?.find((ta: any) => ta.id === tax.specialFields?.taxAmountId);
      const detailQuantity = form.watch('quantity') || 1;
      return detailQuantity * proportion * (taxAmount?.amount || 0);
    }
    
    // IPT (06)
    if (taxType.code === TAX_TYPES.IPT) {
      const taxAmount = taxAmountsData[tax.taxTypeId]?.find((ta: any) => ta.id === tax.specialFields?.taxAmountId);
      const detailQuantity = form.watch('quantity') || 1;
      return detailQuantity * (tax.specialFields?.quantity || 0) * (taxAmount?.amount || 0);
    }
    
    // ISEBEC (05)
    if (taxType.code === TAX_TYPES.ISEBEC) {
      const isNonAlcoholicBeverage = cabys?.startsWith('2202');
      const taxAmount = taxAmountsData[tax.taxTypeId]?.find((ta: any) => ta.id === tax.specialFields?.taxAmountId);
      const detailQuantity = form.watch('quantity') || 1;
      
      if (isNonAlcoholicBeverage) {
        const altAmount = (taxAmount?.amount || 0) / (tax.specialFields?.volumeConsumption || 1);
        return detailQuantity * (tax.specialFields?.quantity || 0) * altAmount;
      } else {
        return (tax.specialFields?.quantity || 0) * (tax.specialFields?.volumeConsumption || 0) * (taxAmount?.amount || 0);
      }
    }
    
    // Others (02, 12, 99)
    return baseAmount * (tax.rate || 0) / 100;
  };

  if (forceCollapsed) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {t('products.advancedTaxes')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <IvaTaxSection
          ivaTaxes={ivaTaxes}
          taxTypes={taxTypes}
          taxRates={taxRates}
          taxFactors={taxFactors}
          onIvaTaxesChange={handleIvaTaxesChange}
          calculateTaxAmount={calculateTaxAmount}
          cabys={cabys}
          cabysDescription={cabysDescription}
          suggestedTaxRate={suggestedTaxRate}
          disabled={disabled}
        />

        <OtherTaxSection
          otherTaxes={otherTaxes}
          taxTypes={taxTypes}
          taxRates={taxRates}
          taxAmounts={taxAmountsData}
          onOtherTaxesChange={handleOtherTaxesChange}
          calculateTaxAmount={calculateTaxAmount}
          loadTaxAmounts={loadTaxAmounts}
          cabys={cabys}
          disabled={disabled}
          form={form}
          isProduct={true}
        />
      </CardContent>
    </Card>
  );
}
