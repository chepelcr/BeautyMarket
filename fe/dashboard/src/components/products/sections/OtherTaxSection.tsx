import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye } from "lucide-react";
import { ClearButton } from "@/components/common/ClearButton";
import { TAX_TYPES, getTaxConfig } from "@/constants/taxTypes";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAllTaxes } from "@/hooks/useDataApi";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { apiRequest } from "@/lib/queryClient";
import { buildDataApiUrl } from "@/lib/apiUtils";
import type { TaxResponse } from "@/services/data-api";

interface Tax {
  taxTypeCode: string;  // Use code instead of ID
  taxRateCode?: string; // Use code instead of ID
  rate: number;
  specialFields?: {
    quantity?: number;
    percentage?: number;
    volumeConsumption?: number;
    taxAmountId?: number;
  };
}

interface TaxType {
  code: string;
  name: string;
}

interface TaxAmount {
  id: string;
  name: string;
  amount: number;
}

interface OtherTaxSectionProps {
  form: any;
  disabled?: boolean;
  isoCode?: string;
}

export function OtherTaxSection({
  form,
  disabled = false,
  isoCode = "188"
}: OtherTaxSectionProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  
  const [isExpanded, setIsExpanded] = useState(!disabled);
  const [taxAmountsData, setTaxAmountsData] = useState<{[taxTypeCode: string]: TaxAmount[]}>({});
  const [showSpecialFields, setShowSpecialFields] = useState<{ [key: number]: boolean }>({});
  const [selectedTaxType, setSelectedTaxType] = useState<TaxType | null>(null);

  const hasFiscalInfo = form.watch("hasFiscalInfo");
  const taxes = form.watch("taxes") || [];
  const cabys = form.watch("cabys");
  const baseAmount = form.watch("baseAmount") || 0;

  // Fetch tax types from data API only
  const { data: dataApiTaxTypes } = useAllTaxes({
    iso_code: isoCode
  });

  const taxTypes: TaxType[] = (dataApiTaxTypes || []).map((t: TaxResponse) => ({
    code: t.code,
    name: t.description
  }));

  // Split taxes into IVA and other taxes
  const ivaTaxes = taxes.filter((t: any) => 
    [TAX_TYPES.IVA, TAX_TYPES.IVACE, TAX_TYPES.IVARBU].includes(t.taxTypeCode as any)
  );

  const otherTaxes = taxes.filter((t: any) => 
    ![TAX_TYPES.IVA, TAX_TYPES.IVACE, TAX_TYPES.IVARBU].includes(t.taxTypeCode as any)
  );

  const handleOtherTaxesChange = (newOtherTaxes: Tax[]) => {
    form.setValue("taxes", [...ivaTaxes, ...newOtherTaxes]);
  };

  const loadTaxAmounts = async (taxTypeCode: string) => {
    if (taxAmountsData[taxTypeCode] || !user?.id || !defaultOrg?.id) return;
    
    const dataApiTax = dataApiTaxTypes?.find(t => t.code === taxTypeCode);
    if (!dataApiTax) return;
    
    try {
      const res = await apiRequest("GET", buildDataApiUrl(`/countries/${isoCode}/taxes/${dataApiTax.id}/amounts/all`));
      const amounts: any[] = await res.json();
      const mappedAmounts = amounts.map((a: any) => ({
        id: String(a.id),
        name: a.description || a.name,
        amount: a.amount || a.percentage
      }));
      setTaxAmountsData(prev => ({ ...prev, [taxTypeCode]: mappedAmounts }));
    } catch (error) {
      console.error('Error loading tax amounts:', error);
    }
  };

  const calculateTaxAmount = (tax: Tax): number => {
    const taxType = taxTypes.find((t: any) => t.code === tax.taxTypeCode);
    if (!taxType) return 0;
    
    // IUC (03)
    if (taxType.code === TAX_TYPES.IUC) {
      const taxAmount = taxAmountsData[tax.taxTypeCode]?.find((ta: any) => ta.id === tax.specialFields?.taxAmountId);
      return (taxAmount?.amount || 0) * (tax.specialFields?.quantity || 0);
    }
    
    // ISEBA (04)
    if (taxType.code === TAX_TYPES.ISEBA) {
      const proportion = (tax.specialFields?.quantity || 0) * (tax.specialFields?.percentage || 0) / 100;
      const taxAmount = taxAmountsData[tax.taxTypeCode]?.find((ta: any) => ta.id === tax.specialFields?.taxAmountId);
      const detailQuantity = form.watch('quantity') || 1;
      return detailQuantity * proportion * (taxAmount?.amount || 0);
    }
    
    // IPT (06)
    if (taxType.code === TAX_TYPES.IPT) {
      const taxAmount = taxAmountsData[tax.taxTypeCode]?.find((ta: any) => ta.id === tax.specialFields?.taxAmountId);
      const detailQuantity = form.watch('quantity') || 1;
      return detailQuantity * (tax.specialFields?.quantity || 0) * (taxAmount?.amount || 0);
    }
    
    // ISEBEC (05)
    if (taxType.code === TAX_TYPES.ISEBEC) {
      const isNonAlcoholicBeverage = cabys?.startsWith('2202');
      const taxAmount = taxAmountsData[tax.taxTypeCode]?.find((ta: any) => ta.id === tax.specialFields?.taxAmountId);
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
  
  // Auto-expand and load amounts when taxes exist
  useEffect(() => {
    if (otherTaxes.length > 0 && taxTypes.length > 0) {
      setIsExpanded(true);
      const newShowState: { [key: number]: boolean } = {};
      otherTaxes.forEach((tax: Tax, index: number) => {
        newShowState[index] = true;
        const taxType = taxTypes.find(t => t.code === tax.taxTypeCode);
        if (taxType?.code) {
          const taxConfig = getTaxConfig(taxType.code);
          if (taxConfig?.requiresSpecialFields) {
            loadTaxAmounts(tax.taxTypeCode);
          }
        }
      });
      setShowSpecialFields(newShowState);
    }
  }, [otherTaxes.length, taxTypes.length]);

  if (!hasFiscalInfo) return null;

  const addOtherTax = () => {
    if (!selectedTaxType) return;
    const taxTypeCode = selectedTaxType.code;
    const defaultRate = 0;
    const newIndex = otherTaxes.length;
    handleOtherTaxesChange([...otherTaxes, {taxTypeCode, rate: defaultRate}]);
    setShowSpecialFields({
      ...showSpecialFields,
      [newIndex]: true
    });
    const taxConfig = getTaxConfig(selectedTaxType.code);
    if (taxConfig?.requiresSpecialFields) {
      loadTaxAmounts(taxTypeCode);
    }
    setSelectedTaxType(null);
    setIsExpanded(true);
  };

  const removeOtherTax = (index: number) => {
    handleOtherTaxesChange(otherTaxes.filter((_: Tax, i: number) => i !== index));
  };

  const updateOtherTax = (index: number, field: string, value: any) => {
    const newTaxes = [...otherTaxes];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'specialFields') {
        newTaxes[index] = {
          ...newTaxes[index],
          specialFields: {
            ...(newTaxes[index].specialFields || {}),
            [child]: value
          }
        };
      }
    } else {
      newTaxes[index] = { ...newTaxes[index], [field]: value };
    }
    handleOtherTaxesChange(newTaxes);
  };

  const getAvailableTaxTypes = () => {
    return taxTypes.filter(t => {
      // Exclude IVA types (01, 07, 08)
      if ([TAX_TYPES.IVA, TAX_TYPES.IVACE, TAX_TYPES.IVARBU].includes(t.code as any)) {
        return false;
      }
      
      // ISEBEC only available for specific CABYS codes
      if (t.code === TAX_TYPES.ISEBEC) {
        const isValidProduct = cabys?.startsWith('2202') || cabys?.startsWith('3401');
        if (!isValidProduct) return false;
      }
      
      // OTHERS type (99) can be repeated
      if (t.code === TAX_TYPES.OTHERS) return true;
      
      // Other types can't be repeated
      return !otherTaxes.some((tax: Tax) => tax.taxTypeCode === t.code);
    });
  };

  const getRequiredSpecialFields = (taxTypeCode: string) => {
    switch (taxTypeCode) {
      case TAX_TYPES.IUC: // 03
        return { quantity: true, percentage: false, volumeConsumption: false, taxAmountId: true };
      case TAX_TYPES.ISEBA: // 04
        return { quantity: true, percentage: true, volumeConsumption: false, taxAmountId: true };
      case TAX_TYPES.ISEBEC: // 05
        const isValidProduct = cabys?.startsWith('2202') || cabys?.startsWith('3401');
        if (isValidProduct) {
          return { quantity: true, percentage: false, volumeConsumption: true, taxAmountId: true };
        }
        return { quantity: false, percentage: false, volumeConsumption: false, taxAmountId: false };
      case TAX_TYPES.IPT: // 06
        return { quantity: true, percentage: false, volumeConsumption: false, taxAmountId: true };
      case TAX_TYPES.ISEC: // 12
        return { quantity: false, percentage: false, volumeConsumption: false, taxAmountId: false };
      default:
        return { quantity: false, percentage: false, volumeConsumption: false, taxAmountId: false };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4"/>
              {t('taxes.specificTaxes')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select 
                value={selectedTaxType?.code || ""} 
                onValueChange={(value) => {
                  const taxType = taxTypes.find(t => t.code === value);
                  setSelectedTaxType(taxType || null);
                }} 
                disabled={disabled}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('taxes.addTax')} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTaxTypes().map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addOtherTax} disabled={!selectedTaxType || disabled}>
                <Plus className="h-4 w-4"/>
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={otherTaxes.length === 0}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded && otherTaxes.length > 0 ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <CardContent>
          <div className="space-y-4">
            {otherTaxes.map((tax: Tax, index: number) => {
              const taxType = taxTypes.find(t => t.code === tax.taxTypeCode);
              const taxConfig = taxType?.code ? getTaxConfig(taxType.code) : undefined;
              const hasSpecialFields = taxConfig?.requiresSpecialFields;
              const requiredFields = getRequiredSpecialFields(taxType?.code || '');
              
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{taxType?.name || t('taxes.tax')}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newShowState = !showSpecialFields[index];
                            setShowSpecialFields({
                              ...showSpecialFields,
                              [index]: newShowState
                            });
                            if (newShowState && hasSpecialFields && !taxAmountsData[tax.taxTypeCode]) {
                              loadTaxAmounts(tax.taxTypeCode);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4"/>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    showSpecialFields[index] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <CardContent>
                      {!hasSpecialFields && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>%</Label>
                            <Input 
                              type="number" 
                              min="0"
                              value={tax.rate} 
                              disabled={![TAX_TYPES.ISC, TAX_TYPES.OTHERS].includes(taxType?.code as any)}
                              onChange={(e) => updateOtherTax(index, 'rate', Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('taxes.calculatedAmount')}</Label>
                            <div className="relative">
                              <Input 
                                value={`₡${calculateTaxAmount(tax).toFixed(2)}`} 
                                disabled 
                                className="bg-gray-100 dark:bg-gray-800 pr-10"
                              />
                              <ClearButton onClick={() => removeOtherTax(index)} />
                            </div>
                          </div>
                        </div>
                      )}
                      {hasSpecialFields && (() => {
                        // Count all fields including taxAmountId
                        const allFields = [
                          requiredFields.taxAmountId && 'taxAmountId',
                          requiredFields.quantity && 'quantity', 
                          requiredFields.percentage && 'percentage',
                          requiredFields.volumeConsumption && 'volumeConsumption',
                          'calculatedAmount' // Always present
                        ].filter(Boolean);
                        
                        const fieldCount = allFields.length;
                        const useThreeColumns = fieldCount === 3;
                        const needsOrphanHandling = !useThreeColumns && fieldCount % 2 === 1;
                        
                        return (
                          <div className={`grid gap-4 ${
                            useThreeColumns ? 'grid-cols-1 sm:grid-cols-3' : 
                            needsOrphanHandling ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
                          }`}>
                            {requiredFields.taxAmountId && (
                              <div className="space-y-2">
                                <Label>{t('taxes.taxAmount')}</Label>
                                <Select
                                  value={(tax.specialFields?.taxAmountId)?.toString() || ""}
                                  onValueChange={(value) => updateOtherTax(index, 'specialFields.taxAmountId', Number(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('taxes.amount')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(taxAmountsData[tax.taxTypeCode] || []).map((amount) => (
                                      <SelectItem key={amount.id} value={amount.id.toString()}>
                                        {amount.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {requiredFields.quantity && (
                              <div className="space-y-2">
                                <Label>{t('taxes.quantity')}</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={taxType?.code === TAX_TYPES.IUC ? (form?.watch('quantity') || 1) : (tax.specialFields?.quantity || "")}
                                  onChange={taxType?.code === TAX_TYPES.IUC ? undefined : (e) => updateOtherTax(index, 'specialFields.quantity', Number(e.target.value))}
                                  readOnly={taxType?.code === TAX_TYPES.IUC}
                                  className={taxType?.code === TAX_TYPES.IUC ? "bg-gray-100 dark:bg-gray-800" : ""}
                                />
                              </div>
                            )}
                            {requiredFields.percentage && (
                              <div className="space-y-2">
                                <Label>{t('taxes.percentage')}</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={tax.specialFields?.percentage || ""}
                                  onChange={(e) => updateOtherTax(index, 'specialFields.percentage', Number(e.target.value))}
                                />
                              </div>
                            )}
                            {requiredFields.volumeConsumption && (
                              <div className="space-y-2">
                                <Label>{t('taxes.volumeConsumption')}</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={tax.specialFields?.volumeConsumption || ""}
                                  onChange={(e) => updateOtherTax(index, 'specialFields.volumeConsumption', Number(e.target.value))}
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>{t('taxes.calculatedAmount')}</Label>
                              <div className="relative">
                                <Input 
                                  key={`${tax.taxTypeCode}-${tax.specialFields?.quantity || 0}-${tax.specialFields?.percentage || 0}-${tax.specialFields?.volumeConsumption || 0}-${tax.specialFields?.taxAmountId || 0}`}
                                  value={`₡${calculateTaxAmount(taxType?.code === TAX_TYPES.IUC ? {...tax, specialFields: {...tax.specialFields, quantity: 1}} : tax).toFixed(2)}`} 
                                  disabled 
                                  className="bg-gray-100 dark:bg-gray-800 pr-10"
                                />
                                <ClearButton onClick={() => removeOtherTax(index)} />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
