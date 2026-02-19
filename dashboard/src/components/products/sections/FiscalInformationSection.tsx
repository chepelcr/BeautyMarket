import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Landmark, Eye, Search } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct } from "@/models";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { CabysModal } from "@/components/products/CabysModal";

interface FiscalInformationSectionProps {
  form: UseFormReturn<InsertProduct>;
}

const PRODUCT_TYPES = [
  { id: 1, description: "Bien" },
  { id: 2, description: "Servicio" },
];

export function FiscalInformationSection({ form }: FiscalInformationSectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCabysModal, setShowCabysModal] = useState(false);

  const handleCabysSelect = (cabys: { codigo: string; descripcion: string; impuesto: number }) => {
    form.setValue("cabys", cabys.codigo);
    form.setValue("cabysDescription", cabys.descripcion);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Información Fiscal
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
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
              {PRODUCT_TYPES.map((type) => (
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
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
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
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowCabysModal(true)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
          </div>
        </CardContent>
      </div>
      
      <CabysModal
        isOpen={showCabysModal}
        onClose={() => setShowCabysModal(false)}
        onSelect={handleCabysSelect}
      />
    </Card>
  );
}
