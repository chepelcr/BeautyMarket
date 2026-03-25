import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, X } from "lucide-react";
import { TAX_TYPES, getTaxConfig, getRequiredSpecialFields } from "@/constants/taxTypes";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Tax {
  taxTypeId: string;
  taxRateId?: string;
  rate: number;
  specialFields?: {
    quantity?: number;
    percentage?: number;
    volumeConsumption?: number;
    taxAmountId?: string;
  };
}

interface TaxType {
  id: string;
  code: string;
  name: string;
}

interface TaxRate {
  id: string;
  code: string;
  name: string;
  rate: number;
}

interface TaxAmount {
  id: string;
  name: string;
  amount: number;
}

interface OtherTaxSectionProps {
  otherTaxes: Tax[];
  taxTypes: TaxType[];
  taxRates: TaxRate[];
  taxAmounts: {[taxTypeId: string]: TaxAmount[]};
  onOtherTaxesChange: (taxes: Tax[]) => void;
  calculateTaxAmount: (tax: Tax) => number;
  loadTaxAmounts: (taxTypeId: string) => void;
  cabys?: string;
  disabled?: boolean;
  form?: any;
  isProduct?: boolean;
}

export function OtherTaxSection({
  otherTaxes,
  taxTypes,
  taxRates,
  taxAmounts,
  onOtherTaxesChange,
  calculateTaxAmount,
  loadTaxAmounts,
  cabys,
  disabled = false,
  form,
  isProduct = true
}: OtherTaxSectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(otherTaxes.length > 0);
  const [showSpecialFields, setShowSpecialFields] = useState<{ [key: number]: boolean }>({});
  const [selectedTaxType, setSelectedTaxType] = useState<TaxType | null>(null);
  
  // Auto-expand and load amounts when taxes exist
  useEffect(() => {
    if (otherTaxes.length > 0 && taxTypes.length > 0) {
      setIsExpanded(true);
      // Auto-expand individual tax cards and load amounts
      const newShowState: { [key: number]: boolean } = {};
      otherTaxes.forEach((tax, index) => {
        newShowState[index] = true;
        const taxType = taxTypes.find(t => t.id === tax.taxTypeId);
        const taxConfig = getTaxConfig(taxType?.code || '');
        if (taxConfig?.requiresSpecialFields) {
          loadTaxAmounts(tax.taxTypeId);
        }
      });
      setShowSpecialFields(newShowState);
    }
  }, [otherTaxes.length, taxTypes.length]);

  const addOtherTax = () => {
    if (!selectedTaxType) return;
    const taxTypeId = selectedTaxType.id;
    const defaultRate = 0;
    const newIndex = otherTaxes.length;
    onOtherTaxesChange([...otherTaxes, {taxTypeId, rate: defaultRate}]);
    setShowSpecialFields({
      ...showSpecialFields,
      [newIndex]: true
    });
    // Load tax amounts for taxes that need them
    const taxConfig = getTaxConfig(selectedTaxType?.code);
    if (taxConfig?.requiresSpecialFields) {
      loadTaxAmounts(taxTypeId);
    }
    setSelectedTaxType(null);
    setIsExpanded(true);
  };

  const removeOtherTax = (index: number) => {
    onOtherTaxesChange(otherTaxes.filter((_, i) => i !== index));
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
    onOtherTaxesChange(newTaxes);
  };

  const getAvailableTaxTypes = () => {
    return taxTypes.filter(t => {
      const taxConfig = getTaxConfig(t.code);
      
      // Exclude IVA types
      if (taxConfig?.iva) return false;
      
      // ISEBEC only available for specific CABYS codes
      if (t.code === TAX_TYPES.ISEBEC) {
        const isValidProduct = cabys?.startsWith('2202') || cabys?.startsWith('3401');
        if (!isValidProduct) return false;
      }
      
      // OTHERS type can be repeated
      if (t.code === TAX_TYPES.OTHERS) return true;
      
      // Other types can't be repeated
      return !otherTaxes.some(tax => tax.taxTypeId === t.id);
    });
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
              <Select value={selectedTaxType?.id || ""} onValueChange={(value) => {
                const taxType = taxTypes.find(t => t.id === value);
                setSelectedTaxType(taxType || null);
              }} disabled={disabled}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('taxes.addTax')} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTaxTypes().map((type) => (
                    <SelectItem key={type.id} value={type.id}>
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
            {otherTaxes.map((tax, index) => {
              const taxType = taxTypes.find(t => t.id === tax.taxTypeId);
              const taxConfig = getTaxConfig(taxType?.code || '');
              const hasSpecialFields = taxConfig?.requiresSpecialFields;
              const requiredFields = getRequiredSpecialFields(taxType?.code || '', cabys);
              
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
                            if (newShowState && hasSpecialFields && !taxAmounts[tax.taxTypeId]) {
                              loadTaxAmounts(tax.taxTypeId);
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
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                onClick={() => removeOtherTax(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {hasSpecialFields && (() => {
                        const allFields = [
                          requiredFields.taxAmountId && 'taxAmountId',
                          requiredFields.quantity && 'quantity', 
                          requiredFields.percentage && 'percentage',
                          requiredFields.volumeConsumption && 'volumeConsumption',
                          'calculatedAmount'
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
                                  value={tax.specialFields?.taxAmountId || ""}
                                  onValueChange={(value) => updateOtherTax(index, 'specialFields.taxAmountId', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('taxes.selectAmount')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(taxAmounts[tax.taxTypeId] || []).map((amount) => (
                                      <SelectItem key={amount.id} value={amount.id}>
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
                                  value={`₡${calculateTaxAmount(isProduct && taxType?.code === TAX_TYPES.IUC ? {...tax, specialFields: {...tax.specialFields, quantity: 1}} : tax).toFixed(2)}`} 
                                  disabled 
                                  className="bg-gray-100 dark:bg-gray-800 pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                  onClick={() => removeOtherTax(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
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
