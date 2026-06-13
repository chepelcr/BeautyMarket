import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Eye } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct } from "@/models";
import { useState, useEffect } from "react";

interface PackagingSectionProps {
  form: UseFormReturn<InsertProduct>;
  disabled?: boolean;
}

export function PackagingSection({ form, disabled = false }: PackagingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!disabled);
  const hasPackageInfo = form.watch("hasPackageInfo");
  const isPackaged = form.watch("isPackaged");

  useEffect(() => {
    if (!isPackaged) {
      form.setValue("quantity", 1);
      const currentPrice = form.watch("price") || 0;
      form.setValue("unitPrice", currentPrice);
    }
  }, [isPackaged, form]);

  if (!hasPackageInfo) return null;

  return (
    <div className="transition-all duration-300 ease-in-out overflow-hidden"
         style={{
           maxHeight: hasPackageInfo ? '500px' : '0',
           opacity: hasPackageInfo ? 1 : 0
         }}>
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información de Empaque
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidades por empaque</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 1;
                        field.onChange(quantity);
                        const unitPrice = form.getValues("unitPrice") || 0;
                        form.setValue("price", unitPrice * quantity);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio unitario</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value || ""}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value) || 0;
                        field.onChange(unitPrice);
                        const quantity = form.getValues("quantity") || 1;
                        form.setValue("price", unitPrice * quantity);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </div>
    </Card>
    </div>
  );
}
