import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator, Plus, Eye } from "lucide-react";
import { useState } from "react";
import { ClearButton } from "@/components/common/ClearButton";

interface AdvancedTaxesSectionProps {
  form: any;
  disabled?: boolean;
}

const TAX_TYPES = [
  { taxId: 1, code: '01', description: 'IVA' },
  { taxId: 2, code: '02', description: 'Impuesto Selectivo de Consumo' },
  { taxId: 3, code: '99', description: 'Otros' }
];

const TAX_RATES = [
  { rateId: 1, description: '13%', percentage: 13 },
  { rateId: 2, description: '4%', percentage: 4 },
  { rateId: 3, description: '2%', percentage: 2 },
  { rateId: 4, description: '1%', percentage: 1 },
  { rateId: 5, description: '0%', percentage: 0 }
];

export function AdvancedTaxesSection({ form, disabled = false }: AdvancedTaxesSectionProps) {
  const taxes = form.watch("taxes") || [];
  const [isExpanded, setIsExpanded] = useState(taxes.length > 0);
  const [selectedTaxType, setSelectedTaxType] = useState<string>("");

  const addTax = () => {
    if (!selectedTaxType) return;
    
    const taxType = TAX_TYPES.find(t => t.taxId === parseInt(selectedTaxType));
    const currentTaxes = form.getValues("taxes") || [];
    form.setValue("taxes", [
      ...currentTaxes,
      {
        taxTypeId: parseInt(selectedTaxType),
        code: taxType?.code,
        taxRateId: 1,
        rate: 13
      }
    ]);
    
    setSelectedTaxType("");
    setIsExpanded(true);
  };

  const removeTax = (index: number) => {
    const currentTaxes = form.getValues("taxes") || [];
    const newTaxes = currentTaxes.filter((_: any, i: number) => i !== index);
    form.setValue("taxes", newTaxes);
    if (newTaxes.length === 0) {
      setIsExpanded(false);
    }
  };

  const updateTax = (index: number, field: string, value: any) => {
    const currentTaxes = form.getValues("taxes") || [];
    const newTaxes = [...currentTaxes];
    
    if (field === 'taxRateId') {
      const rate = TAX_RATES.find(r => r.rateId === parseInt(value));
      const taxType = TAX_TYPES.find(t => t.taxId === newTaxes[index].taxTypeId);
      newTaxes[index] = { 
        ...newTaxes[index], 
        taxRateId: parseInt(value),
        rate: rate?.percentage || 0,
        code: taxType?.code
      };
    } else {
      newTaxes[index] = { ...newTaxes[index], [field]: value };
    }
    
    form.setValue("taxes", newTaxes);
  };

  const baseAmount = form.watch("baseAmount") || 0;

  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Impuestos
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedTaxType} onValueChange={setSelectedTaxType} disabled={disabled}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Agregar impuesto" />
                </SelectTrigger>
                <SelectContent>
                  {TAX_TYPES.map((type) => (
                    <SelectItem key={type.taxId} value={type.taxId.toString()}>
                      {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addTax} disabled={!selectedTaxType || disabled}>
                <Plus className="h-4 w-4"/>
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={taxes.length === 0}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <CardContent>
          <div className="space-y-4">
            {taxes.map((tax: any, index: number) => {
              const taxType = TAX_TYPES.find(t => t.taxId === tax.taxTypeId);
              const taxAmount = baseAmount * (tax.rate || 0) / 100;
              
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Impuesto</Label>
                        <Input value={taxType?.description || ''} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Tarifa</Label>
                        <Select
                          value={tax.taxRateId?.toString() || ""}
                          onValueChange={(value) => updateTax(index, 'taxRateId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tarifa" />
                          </SelectTrigger>
                          <SelectContent>
                            {TAX_RATES.map((rate) => (
                              <SelectItem key={rate.rateId} value={rate.rateId.toString()}>
                                {rate.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>%</Label>
                        <Input type="number" value={tax.rate} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Monto</Label>
                        <div className="relative">
                          <Input 
                            value={`₡${taxAmount.toFixed(2)}`} 
                            disabled 
                            className="bg-gray-100 dark:bg-gray-800 pr-10"
                          />
                          <ClearButton onClick={() => removeTax(index)} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
