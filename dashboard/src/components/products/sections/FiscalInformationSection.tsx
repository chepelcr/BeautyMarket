import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Landmark, Eye, Search, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct } from "@/models";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { CabysModal } from "@/components/products/CabysModal";
import { IvaTaxSection } from "./IvaTaxSection";
import { useAllProductTypes, useAllTaxes, useAllTaxRates, useAllTaxFactors } from "@/hooks/useDataApi";
import { TAX_TYPES } from "@/constants/taxTypes";
import type { TaxResponse, TaxRateResponse, TaxFactorResponse } from "@/services/data-api";

interface FiscalInformationSectionProps {
  form: UseFormReturn<InsertProduct>;
  isInsertMode?: boolean;
  hasCabysSelected?: boolean;
  onCabysSelect?: () => void;
  onCabysClear?: () => void;
  disabled?: boolean;
  isoCode?: string;
}

export function FiscalInformationSection({ 
  form, 
  isInsertMode = false,
  hasCabysSelected = false,
  onCabysSelect,
  onCabysClear,
  disabled = false,
  isoCode = "188"
}: FiscalInformationSectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(!disabled);
  const [showCabysModal, setShowCabysModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const hasFiscalInfo = form.watch("hasFiscalInfo");

  // Fetch product types from data API
  const { data: productTypes, isLoading: productTypesLoading } = useAllProductTypes();

  // Fetch tax types from data API only
  const { data: dataApiTaxTypes } = useAllTaxes({ iso_code: isoCode });

  const taxTypes = (dataApiTaxTypes || []).map((t: TaxResponse) => ({
    code: t.code,
    name: t.description
  }));
  
  // Fetch tax rates from data API only
  const { data: dataApiTaxRates } = useAllTaxRates({ iso_code: isoCode });

  const taxRates = (dataApiTaxRates || []).map((r: TaxRateResponse) => ({
    code: r.code,
    name: r.description,
    rate: r.percentage
  }));

  // Check if any tax is IVARBU (code '08') to determine if we need to fetch tax factors
  const taxes = form.watch("taxes") || [];
  const hasIvarbuTax = taxes.some((t: any) => t.taxTypeCode === TAX_TYPES.IVARBU);

  // Fetch tax factors only if IVARBU tax exists (data API only)
  const { data: dataApiTaxFactors } = useAllTaxFactors({
    iso_code: isoCode
  }, {
    enabled: hasIvarbuTax
  });

  const taxFactors = (dataApiTaxFactors || []).map((f: TaxFactorResponse) => ({
    code: f.id.toString(), // Use id as code since there's no code field
    name: f.description,
    factor: f.factor // Use the factor field from the API
  }));

  if (!hasFiscalInfo) return null;

  // Split taxes into IVA and other taxes
  // Map to ensure taxTypeCode is always present for IVA taxes
  const ivaTaxes = taxes
    .filter((t: any) => 
      t.taxTypeCode && [TAX_TYPES.IVA, TAX_TYPES.IVACE, TAX_TYPES.IVARBU].includes(t.taxTypeCode as any)
    )
    .map((t: any) => ({
      taxTypeCode: t.taxTypeCode as string, // Assert as string since we filtered for it
      taxRateCode: t.taxRateCode,
      taxFactorCode: t.taxFactorCode,
      rate: t.rate || 0
    }));

  const otherTaxes = taxes.filter((t: any) => 
    t.taxTypeCode && ![TAX_TYPES.IVA, TAX_TYPES.IVACE, TAX_TYPES.IVARBU].includes(t.taxTypeCode as any)
  );

  const handleIvaTaxesChange = (newIvaTaxes: any[]) => {
    form.setValue("taxes", [...newIvaTaxes, ...otherTaxes]);
  };

  const calculateTaxAmount = (tax: any) => {
    const baseAmount = form.watch("baseAmount") || 0;
    const subtotal = form.watch("price") || 0;
    const taxType = taxTypes.find((t: any) => t.code === tax.taxTypeCode);
    if (!taxType) return 0;
    
    // IVA taxes (01, 07)
    if (taxType.code === TAX_TYPES.IVA || taxType.code === TAX_TYPES.IVACE) {
      return baseAmount * (tax.rate || 0) / 100;
    }
    
    // IVARBU (08)
    if (taxType.code === TAX_TYPES.IVARBU) {
      return (tax.rate || 0) * subtotal;
    }
    
    return 0;
  };

  const handleCabysSelect = (cabys: { codigo: string; descripcion: string; impuesto: number }) => {
    form.setValue("cabys", cabys.codigo);
    form.setValue("cabysDescription", cabys.descripcion);
    
    // Store suggested tax rate
    const suggestedTaxRate = cabys.impuesto || 13;
    
    // Auto-create IVA tax if no taxes exist
    const currentTaxes = form.getValues("taxes") || [];
    if (currentTaxes.length === 0 && taxTypes) {
      // Find IVA tax type (code '01')
      const ivaTaxType = taxTypes.find(t => t.code === '01');
      if (ivaTaxType) {
        // Find matching tax rate by percentage
        // The CABYS response includes tax_rate with code, so we need to find it
        // For now, we'll find by percentage match
        const matchingRate = taxRates?.find(r => r.rate === suggestedTaxRate);
        
        // Create default IVA tax with suggested rate from CABYS
        // Use tax code instead of ID for stability
        form.setValue("taxes", [{
          taxType: '01', // Keep for backward compatibility
          taxTypeCode: '01',
          taxRateCode: matchingRate?.code,
          rate: suggestedTaxRate
        }]);
      }
    }
    
    setSearchTerm(""); // Clear search term after selection
    onCabysSelect?.();
  };
  
  const handleCabysClear = () => {
    form.setValue("cabys", "");
    form.setValue("cabysDescription", "");
    setSearchTerm("");
    onCabysClear?.();
  };

  const handleOpenModal = () => {
    const currentDescription = form.getValues("cabysDescription");
    setSearchTerm(currentDescription || "");
    setShowCabysModal(true);
  };
  
  const cabysValue = form.watch("cabys");
  const showCabysCode = !isInsertMode || (isInsertMode && cabysValue);

  return (
    <div className="transition-all duration-300 ease-in-out overflow-hidden"
         style={{
           maxHeight: hasFiscalInfo ? '2000px' : '0',
           opacity: hasFiscalInfo ? 1 : 0
         }}>
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Información Fiscal (Opcional)
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
        <CardContent className="space-y-4">
          <div className="flex flex-col">
            <FormLabel>Tipo de Producto</FormLabel>
            <div className="flex gap-4 mt-2">
              {productTypesLoading ? (
                <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
              ) : (
                productTypes?.map((type) => (
                  <FormField
                    key={type.id}
                    control={form.control}
                    name="productTypeId"
                    render={({ field }) => (
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value={type.id}
                          checked={field.value === type.id}
                          onChange={() => field.onChange(type.id)}
                          className="form-radio"
                        />
                        <span className="text-sm">{type.description}</span>
                      </label>
                    )}
                  />
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={showCabysCode ? "sm:col-span-2" : "sm:col-span-3"}>
              <FormField
                control={form.control}
                name="cabysDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción CABYS</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Descripción del código CABYS"
                          {...field}
                          value={field.value || ""}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (!hasCabysSelected) {
                                handleOpenModal();
                              }
                            }
                          }}
                        />
                        {!hasCabysSelected ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleOpenModal}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleCabysClear}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {showCabysCode && (
              <FormField
                control={form.control}
                name="cabys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código CABYS</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234567890123"
                        {...field}
                        value={field.value || ""}
                        maxLength={13}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          {/* IVA Tax Section - appears after CABYS is selected */}
          {hasCabysSelected && (
            <div className="mt-6">
              <IvaTaxSection
                ivaTaxes={ivaTaxes}
                taxTypes={taxTypes}
                taxRates={taxRates}
                taxFactors={taxFactors}
                onIvaTaxesChange={handleIvaTaxesChange}
                calculateTaxAmount={calculateTaxAmount}
                cabys={form.watch("cabys") || undefined}
                cabysDescription={form.watch("cabysDescription") || undefined}
                suggestedTaxRate={form.watch("taxes.0.rate") || 13}
                disabled={disabled}
              />
            </div>
          )}
        </CardContent>
      </div>
      
      <CabysModal
        isOpen={showCabysModal}
        onClose={() => setShowCabysModal(false)}
        onSelect={handleCabysSelect}
        initialSearchTerm={searchTerm}
        productTypeId={form.watch("productTypeId")}
      />
    </Card>
    </div>
  );
}
