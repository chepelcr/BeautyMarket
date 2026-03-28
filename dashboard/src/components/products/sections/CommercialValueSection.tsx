import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Eye } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct } from "@/models";
import { useState, useEffect } from "react";
import { DiscountCalculationService } from "@/services/discountCalculationService";
import { TaxCalculationService } from "@/services/taxCalculationService";
import { getTaxConfig } from "@/types/taxTypeConfig";

interface CommercialValueSectionProps {
  form: UseFormReturn<InsertProduct>;
  disabled?: boolean;
}

const TAX_TYPES = [
  { taxId: 1, code: '01', description: 'IVA' },
  { taxId: 2, code: '02', description: 'Impuesto Selectivo de Consumo' },
  { taxId: 7, code: '07', description: 'IVA (Cálculo Especial)' },
  { taxId: 3, code: '99', description: 'Otros' }
];

export function CommercialValueSection({ form, disabled = false }: CommercialValueSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!disabled);

  const price = form.watch("price") || 0;
  const discounts = form.watch("discounts") || [];
  const taxes = form.watch("taxes") || [];

  const totalDiscountAmount = DiscountCalculationService.calculateTotalDiscountAmount(price, discounts);
  const subtotal = DiscountCalculationService.calculateSubtotal(price, discounts);

  const hasIvace = taxes.some((tax: any) => {
    const taxType = TAX_TYPES.find(tt => tt.taxId === tax.taxTypeId);
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
    const taxType = TAX_TYPES.find(tt => tt.taxId === tax.taxTypeId);
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
