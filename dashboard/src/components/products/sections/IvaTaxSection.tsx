import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, AlertCircle, Eye } from "lucide-react";
import { TAX_TYPES } from "@/constants/taxTypes";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Tax {
  taxTypeId: string;
  taxRateId?: string;
  taxFactorId?: string;
  rate: number;
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

interface TaxFactor {
  id: string;
  name: string;
  factor: number;
}

interface IvaTaxSectionProps {
  ivaTaxes: Tax[];
  taxTypes: TaxType[];
  taxRates: TaxRate[];
  taxFactors: TaxFactor[];
  onIvaTaxesChange: (taxes: Tax[]) => void;
  calculateTaxAmount: (tax: Tax) => number;
  cabys?: string;
  cabysDescription?: string;
  suggestedTaxRate?: number;
  disabled?: boolean;
}

export function IvaTaxSection({
  ivaTaxes,
  taxTypes,
  taxRates,
  taxFactors,
  onIvaTaxesChange,
  calculateTaxAmount,
  cabys,
  suggestedTaxRate,
  disabled = false
}: IvaTaxSectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Auto-expand when enabled (not disabled)
  useEffect(() => {
    if (!disabled) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [disabled]);

  const updateIvaTax = (index: number, field: string, value: any) => {
    const newTaxes = [...ivaTaxes];
    newTaxes[index] = { ...newTaxes[index], [field]: value };
    onIvaTaxesChange(newTaxes);
  };

  const handleTaxTypeChange = (index: number, value: string) => {
    const taxType = taxTypes.find(t => t.id === value);
    if (!taxType) return;
    
    updateIvaTax(index, 'taxTypeId', value);
    
    // Reset rate/factor when changing type
    if (taxType.code === TAX_TYPES.IVARBU) {
      updateIvaTax(index, 'taxRateId', undefined);
      updateIvaTax(index, 'rate', 0);
    } else {
      updateIvaTax(index, 'taxFactorId', undefined);
      updateIvaTax(index, 'rate', suggestedTaxRate || 13);
    }
  };

  const handleRateChange = (index: number, value: string) => {
    const rate = taxRates.find(r => r.id === value);
    if (!rate) return;
    
    updateIvaTax(index, 'taxRateId', value);
    updateIvaTax(index, 'rate', rate.rate);
  };

  const handleFactorChange = (index: number, value: string) => {
    const factor = taxFactors.find(f => f.id === value);
    if (!factor) return;
    
    updateIvaTax(index, 'taxFactorId', value);
    updateIvaTax(index, 'rate', factor.factor);
  };

  const getIvaTaxTypes = () => taxTypes.filter(t => 
    [TAX_TYPES.IVA, TAX_TYPES.IVACE, TAX_TYPES.IVARBU].includes(t.code as any)
  );

  const shouldShowTaxRateWarning = (tax: Tax) => {
    const taxType = taxTypes.find(t => t.id === tax.taxTypeId);
    if (!taxType || taxType.code === TAX_TYPES.IVARBU) return false;
    if (!cabys) return false;
    
    return tax.rate !== suggestedTaxRate;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4"/>
            {t('taxes.valueAddedTax')}
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
          <div className="space-y-4">
            {ivaTaxes.map((tax, index) => {
              const taxType = taxTypes.find(t => t.id === tax.taxTypeId);
              const isCode08 = taxType?.code === TAX_TYPES.IVARBU;
              return (
                <div key={index} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>{t('taxes.ivaType')}</Label>
                      <Select
                        value={tax.taxTypeId}
                        onValueChange={(value) => handleTaxTypeChange(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('taxes.selectIVA')}/>
                        </SelectTrigger>
                        <SelectContent>
                          {getIvaTaxTypes().map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {!isCode08 && (
                      <div className="space-y-2">
                        <Label>{t('taxes.rate')}</Label>
                        <Select
                          value={tax.taxRateId || ""}
                          onValueChange={(value) => handleRateChange(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('taxes.selectRate')}/>
                          </SelectTrigger>
                          <SelectContent>
                            {taxRates.map((rate) => (
                              <SelectItem key={rate.id} value={rate.id}>
                                {rate.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {isCode08 && (
                      <div className="space-y-2">
                        <Label>{t('taxes.selectFactor')}</Label>
                        <Select
                          value={tax.taxFactorId || ""}
                          onValueChange={(value) => handleFactorChange(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('taxes.selectFactor')}/>
                          </SelectTrigger>
                          <SelectContent>
                            {taxFactors.map((factor) => (
                              <SelectItem key={factor.id} value={factor.id}>
                                {factor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>%</Label>
                      <Input type="number" value={tax.rate} disabled/>
                      {shouldShowTaxRateWarning(tax) && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>{t('taxes.suggestedRate')}: {suggestedTaxRate}%</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{t('taxes.amount')}</Label>
                      <Input value={`₡${calculateTaxAmount(tax).toFixed(2)}`} disabled/>
                    </div>
                  </div>
                </div>
              );
            })}
            {ivaTaxes.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                {t('taxes.selectCabysForTaxes')}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
