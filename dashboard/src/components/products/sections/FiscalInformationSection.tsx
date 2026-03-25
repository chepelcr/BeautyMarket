import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Landmark, Eye, Search, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct } from "@/models";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { CabysModal } from "@/components/products/CabysModal";

interface FiscalInformationSectionProps {
  form: UseFormReturn<InsertProduct>;
  isInsertMode?: boolean;
  hasCabysSelected?: boolean;
  onCabysSelect?: () => void;
  onCabysClear?: () => void;
}

const PRODUCT_TYPES = [
  { id: 1, description: "Bien" },
  { id: 2, description: "Servicio" },
];

export function FiscalInformationSection({ 
  form, 
  isInsertMode = false,
  hasCabysSelected = false,
  onCabysSelect,
  onCabysClear
}: FiscalInformationSectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCabysModal, setShowCabysModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCabysSelect = (cabys: { codigo: string; descripcion: string; impuesto: number }) => {
    form.setValue("cabys", cabys.codigo);
    form.setValue("cabysDescription", cabys.descripcion);
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
        </CardContent>
      </div>
      
      <CabysModal
        isOpen={showCabysModal}
        onClose={() => setShowCabysModal(false)}
        onSelect={handleCabysSelect}
        initialSearchTerm={searchTerm}
      />
    </Card>
  );
}
