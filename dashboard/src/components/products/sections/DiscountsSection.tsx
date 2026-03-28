import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Eye } from "lucide-react";
import { useState } from "react";
import { DiscountCalculationService } from "@/services/discountCalculationService";
import { ClearButton } from "@/components/common/ClearButton";

interface DiscountsSectionProps {
  form: any;
  disabled?: boolean;
  forceCollapsed?: boolean;
}

const DISCOUNT_TYPES = [
  { id: 1, code: '01', description: 'Regalía' },
  { id: 2, code: '02', description: 'Descuento comercial' },
  { id: 3, code: '03', description: 'Bonificación' },
  { id: 4, code: '04', description: 'Descuento por pronto pago' },
  { id: 5, code: '99', description: 'Otro' }
];

export function DiscountsSection({ form, disabled = false, forceCollapsed = false }: DiscountsSectionProps) {
  const discounts = form.watch("discounts") || [];
  const [isExpanded, setIsExpanded] = useState(!forceCollapsed && discounts.length > 0);
  const [selectedDiscountType, setSelectedDiscountType] = useState<string>("");
  const [cardExpanded, setCardExpanded] = useState<{[key: string]: boolean}>({});

  const addDiscount = () => {
    if (!selectedDiscountType) return;
    
    const currentDiscounts = form.getValues("discounts") || [];
    form.setValue("discounts", [
      ...currentDiscounts,
      {
        discountTypeId: parseInt(selectedDiscountType),
        reason: "",
        percentage: 0
      }
    ]);
    
    setCardExpanded(prev => ({
      ...prev,
      [selectedDiscountType]: true
    }));
    
    setSelectedDiscountType("");
    setIsExpanded(true);
  };

  const removeDiscount = (index: number) => {
    const currentDiscounts = form.getValues("discounts") || [];
    const newDiscounts = currentDiscounts.filter((_: any, i: number) => i !== index);
    form.setValue("discounts", newDiscounts);
    if (newDiscounts.length === 0) {
      setIsExpanded(false);
    }
  };

  const updateDiscount = (index: number, field: string, value: any) => {
    const currentDiscounts = form.getValues("discounts") || [];
    const newDiscounts = [...currentDiscounts];
    
    if (field === 'percentage') {
      newDiscounts[index] = { 
        ...newDiscounts[index], 
        percentage: value,
        isAmount: false 
      };
    } else if (field === 'amount') {
      newDiscounts[index] = { 
        ...newDiscounts[index], 
        amount: value,
        isAmount: true 
      };
    } else {
      newDiscounts[index] = { ...newDiscounts[index], [field]: value };
    }
    
    form.setValue("discounts", newDiscounts);
  };

  const isOtherDiscountType = (discountTypeId: number) => {
    const discountType = DISCOUNT_TYPES.find((dt: any) => dt.id === discountTypeId);
    return discountType?.code === '99';
  };

  const netPrice = form.watch("price") || 0;
  const totalDiscount = DiscountCalculationService.calculateTotalDiscountAmount(netPrice, discounts);

  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Minus className="h-4 w-4"/>
              Descuentos
            </CardTitle>
            <div className="flex items-center gap-2">
              {!isExpanded && discounts.length > 0 && (
                <Input
                  value={`₡${totalDiscount.toFixed(2)}`}
                  readOnly
                  className="w-32 bg-muted"
                />
              )}
              <Select value={selectedDiscountType} onValueChange={setSelectedDiscountType} disabled={disabled}>
                <SelectTrigger className="w-48 pl-3">
                  <SelectValue placeholder="Agregar descuento" />
                </SelectTrigger>
                <SelectContent>
                  {DISCOUNT_TYPES.map((type: any) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addDiscount} disabled={!selectedDiscountType || disabled}>
                <Plus className="h-4 w-4"/>
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={discounts.length === 0 || disabled}
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
          {(() => {
            const groupedDiscounts = discounts.reduce((groups: any, discount: any, index: number) => {
              const typeId = discount.discountTypeId;
              if (!groups[typeId]) {
                groups[typeId] = [];
              }
              groups[typeId].push({ ...discount, originalIndex: index });
              return groups;
            }, {});

            return Object.entries(groupedDiscounts).map(([typeId, typeDiscounts]: [string, any]) => {
              const discountType = DISCOUNT_TYPES.find((dt: any) => dt.id === parseInt(typeId));
              
              return (
                <Card key={typeId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{discountType?.description || 'Descuento'}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label>Total</Label>
                          <Input value={`₡${typeDiscounts.reduce((sum: number, d: any) => sum + DiscountCalculationService.calculateDiscountAmount(netPrice, d), 0).toFixed(2)}`} disabled className="w-32"/>
                        </div>
                        <Button 
                          type="button"
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setCardExpanded(prev => ({
                              ...prev,
                              [typeId]: !prev[typeId]
                            }));
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    cardExpanded[typeId] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <CardContent>
                      <div className="space-y-4">
                      {typeDiscounts.map((discount: any) => (
                        <div key={discount.originalIndex} className="flex flex-col sm:flex-row gap-4 p-4 border rounded">
                          {isOtherDiscountType(discount.discountTypeId) && (
                            <div className="flex-[2] space-y-2">
                              <Label>Razón</Label>
                              <Input
                                value={discount.reason || ""}
                                onChange={(e) => updateDiscount(discount.originalIndex, 'reason', e.target.value)}
                                placeholder="Especificar razón del descuento"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <Label>Porcentaje</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={discount.percentage || 0}
                              onChange={(e) => updateDiscount(discount.originalIndex, 'percentage', Number(e.target.value))}
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>Monto</Label>
                            <div className="relative">
                              <Input 
                                value={`₡${DiscountCalculationService.calculateDiscountAmount(netPrice, discount).toFixed(2)}`} 
                                disabled 
                                className="bg-muted pr-10"
                              />
                              <ClearButton onClick={() => removeDiscount(discount.originalIndex)} />
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            });
          })()}
        </div>
        </CardContent>
      </div>
    </Card>
  );
}
