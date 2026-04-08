import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Eye, Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct } from "@/models";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { ClearButton } from "@/components/common/ClearButton";
import { useAllCodes } from "@/hooks/useDataApi";

interface CodesSectionProps {
  form: UseFormReturn<InsertProduct>;
  disabled?: boolean;
  forceCollapsed?: boolean;
  isoCode?: string; // ISO code from organization context - when it changes, React Query automatically refetches
}

export function CodesSection({ form, disabled = false, forceCollapsed = false, isoCode = "CR" }: CodesSectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(!forceCollapsed);
  const [selectedCodeType, setSelectedCodeType] = useState("");
  
  // Fetch code types from data API
  const { data: codeTypesData, isLoading: codeTypesLoading, isError: codeTypesError, refetch: refetchCodeTypes } = 
    useAllCodes({ iso_code: isoCode });
  
  // Transform API response to match existing CODE_TYPES structure
  const CODE_TYPES = codeTypesData?.map(ct => ({
    codeTypeId: ct.code,
    code: ct.code,
    description: ct.description
  })) || [];


  const addCode = () => {
    if (!selectedCodeType) return;
    
    const currentCodes = form.getValues("codes") || [];
    const codeType = CODE_TYPES.find(ct => ct.codeTypeId === selectedCodeType);
    
    form.setValue("codes", [
      ...currentCodes,
      {
        codeTypeId: selectedCodeType,
        number: "",
        description: codeType?.description || ""
      }
    ]);
    setSelectedCodeType("");
  };

  const removeCode = (index: number) => {
    const currentCodes = form.getValues("codes") || [];
    form.setValue("codes", currentCodes.filter((_: any, i: number) => i !== index));
  };

  const codes = form.watch("codes") || [];
  
  // Show error state if code types failed to load
  if (codeTypesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {t("products.form.codes")}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive flex items-center gap-2">
            {t('common.errorLoadingData')}
            <Button 
              type="button"
              variant="link" 
              size="sm" 
              onClick={() => refetchCodeTypes()}
              className="h-auto p-0"
            >
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {t("products.form.codes")}
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedCodeType} onValueChange={setSelectedCodeType} disabled={disabled || codeTypesLoading}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={codeTypesLoading ? t('common.loading') : "Agregar código"} />
              </SelectTrigger>
              <SelectContent>
                {CODE_TYPES.filter(codeType => 
                  !codes.some((code: any) => code.codeTypeId === codeType.codeTypeId)
                ).map((codeType) => (
                  <SelectItem key={codeType.codeTypeId} value={codeType.codeTypeId}>
                    {codeType.code} - {codeType.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={addCode} disabled={!selectedCodeType || disabled || codeTypesLoading} type="button">
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={codes.length === 0 || disabled}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded && codes.length > 0 ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {codes.map((code: any, index: number) => {
              const isLastOdd = codes.length % 2 === 1 && index === codes.length - 1;
              const codeType = CODE_TYPES.find(ct => ct.codeTypeId === code.codeTypeId);
              const codeLabel = codeType?.description || "Código";
              
              return (
                <FormField
                  key={index}
                  control={form.control}
                  name={`codes.${index}.number`}
                  render={({ field }) => (
                    <FormItem className={`flex flex-col space-y-2 ${isLastOdd ? "md:col-span-2" : ""}`}>
                      <FormLabel>{codeLabel}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Ingrese código"
                            className="pr-10"
                            maxLength={20}
                          />
                          <ClearButton onClick={() => removeCode(index)} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
