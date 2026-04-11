import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Eye } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct } from "@/models";
import { useState, useEffect, useMemo } from "react";
import { DiscountCalculationService } from "@/services/discountCalculationService";
import { TaxCalculationService } from "@/services/taxCalculationService";
import { useAllTaxes } from "@/hooks/useDataApi";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { getTaxConfig } from "@/constants/taxTypes";

interface CommercialValueSectionProps {
  form: UseFormReturn<InsertProduct>;
  disabled?: boolean;
}

export function CommercialValueSection({ form, disabled = false }: CommercialValueSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!disabled);
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  
  // Get ISO code from organization
  const isoCode = useMemo(() => {
    // @ts-ignore - organization_country field will be added to Organization model
    return defaultOrg?.organization_country || "188";
  }, [defaultOrg]);

  // Fetch tax types from data API (document_version_id is automatically injected)
  const { data: dataApiTaxTypes, isError: taxTypesError } = useAllTaxes({
    iso_code: isoCode
  });

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
  const TAX_TYPES = dataApiTaxTypes || orgTaxTypes || [];

  const price = form.watch("price") || 0;
  const discounts = form.watch("discounts") || [];
  const taxes = form.watch("taxes") || [];

  const totalDiscountAmount = DiscountCalculationService.calculateTotalDiscountAmount(price, discounts);
  const subtotal = DiscountCalculationService.calculateSubtotal(price, discounts);

  const hasIvace = taxes.some((tax: any) => {
    const taxType = TAX_TYPES.find((tt: any) => tt.id === tax.taxTypeId);
    return taxType?.code === '07';
  });

  const lineAmounts = TaxCalculationService.getLineAmounts({
    subtotal,
    baseAmount: hasIvace ? form.watch("baseAmount") : undefined,
    taxes,
    taxTypes: TAX_TYPES,
    discounts,
    detailQuantity: 1,
    cabys: form.watch("cabys") ?? undefined,
    taxAmounts: {}
  });

  const { totalAmountLine: salePrice, baseAmount, ivaTaxTotal, otherTaxTotal } = lineAmounts;

  useEffect(() => {
    if (!hasIvace) {
      form.setValue("baseAmount", baseAmount);
    }
    form.setValue("salePrice", salePrice);
  }, [baseAmount, salePrice, hasIvace, form]);

  const hasOtherTaxes = (taxes as any[]).some((tax: any) => {
    const taxType = TAX_TYPES.find((tt: any) => tt.id === tax.taxTypeId);
    const taxConfig = getTaxConfig(taxType?.code);
    return taxType && !taxConfig?.iva;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Valor del Artículo
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={disabled}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Neto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Descuentos</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={totalDiscountAmount.toFixed(2)}
                  readOnly
                  className="bg-muted"
                />
              </FormControl>
            </FormItem>
            {hasIvace ? (
              <FormField
                control={form.control}
                name="baseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Imponible</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ) : (
              <FormItem>
                <FormLabel>Base Imponible</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={baseAmount.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            )}
            <FormItem>
              <FormLabel>Total IVA</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={ivaTaxTotal.toFixed(2)}
                  readOnly
                  className="bg-muted"
                />
              </FormControl>
            </FormItem>
            {hasOtherTaxes && (
              <FormItem>
                <FormLabel>Otros Impuestos</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={otherTaxTotal.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            )}
            <FormItem>
              <FormLabel>Precio de Venta</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={salePrice.toFixed(2)}
                  readOnly
                  className="bg-muted"
                />
              </FormControl>
            </FormItem>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
