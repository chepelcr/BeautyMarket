import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { User, X, Eye } from "lucide-react";
import { useOrdersApi } from "@/hooks/useOrdersApi";
import { useToast } from "@/hooks/use-toast";
import { ClearButton } from "@/components/common/ClearButton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface PersonalDataSectionProps {
  form: any;
  customerTypes: any[];
  countries: any[];
  identificationTypes: any[];
  isEditing?: boolean;
  fieldErrors?: any;
  onBusinessNameFromApi?: (hasBusinessName: boolean) => void;
}

const applyIdMask = (value: string, code: string) => {
  const numbers = value.replace(/\D/g, '');
  if (code === '01') {
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 5) return numbers.replace(/(\d{1})(\d+)/, '$1-$2');
    return numbers.replace(/(\d{1})(\d{4})(\d+)/, '$1-$2-$3');
  }
  if (code === '02') {
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 4) return numbers.replace(/(\d{1})(\d+)/, '$1-$2');
    return numbers.replace(/(\d{1})(\d{3})(\d+)/, '$1-$2-$3');
  }
  return numbers;
};

const validateIdLength = (value: string, code: string) => {
  const numbers = value.replace(/\D/g, '');
  if (code === '01') return numbers.length === 9;
  if (code === '02') return numbers.length === 10;
  if (code === '03') return numbers.length >= 11 && numbers.length <= 12;
  if (code === '04') return numbers.length === 11;
  return true;
};

export function PersonalDataSection({ form, customerTypes, countries, identificationTypes, isEditing = false, fieldErrors, onBusinessNameFromApi }: PersonalDataSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { api: ordersApi } = useOrdersApi();
  const { toast } = useToast();
  const { t } = useLanguage();
  const watchedNationality = form.watch("nationality");
  const watchedCustomerType = form.watch("customerType");
  const watchedIdCode = form.watch("identification.code");
  const isCostaRica = watchedNationality === "CR";
  
  const getFilteredIdentificationTypes = () => {
    if (!identificationTypes) return [];
    
    if (watchedNationality !== "CR") {
      return identificationTypes.filter((type: any) => type.code === "05");
    }
    
    if (watchedCustomerType === 1) {
      return identificationTypes.filter((type: any) => ["01", "03", "04"].includes(type.code));
    }
    
    if (watchedCustomerType === 2) {
      return identificationTypes.filter((type: any) => ["02", "04"].includes(type.code));
    }
    
    return identificationTypes;
  };
  
  const filteredIdentificationTypes = getFilteredIdentificationTypes();
  
  // Auto-select identification type when filters change
  React.useEffect(() => {
    if (filteredIdentificationTypes.length > 0) {
      const currentType = form.getValues("identification.type");
      const isCurrentTypeValid = filteredIdentificationTypes.some((type: any) => type.typeId === currentType);
      
      if (!isCurrentTypeValid) {
        const newType = watchedNationality !== "CR" 
          ? filteredIdentificationTypes.find((type: any) => type.code === "05")
          : filteredIdentificationTypes[0];
        
        if (newType) {
          form.setValue("identification.type", newType.typeId);
          form.setValue("identification.code", newType.code);
          form.setValue("identification.number", "");
          form.setValue("businessName", "");
          setIdComplete(false);
        }
      }
    }
  }, [watchedNationality, watchedCustomerType, filteredIdentificationTypes, form]);
  
  const [idComplete, setIdComplete] = React.useState(false);
  
  const handleIdNumberChange = async (value: string) => {
    const code = watchedIdCode || '01';
    const maskedValue = applyIdMask(value, code);
    form.setValue('identification.number', maskedValue);
    
    const isComplete = validateIdLength(maskedValue, code);
    setIdComplete(isComplete);
    
    if (isCostaRica && isComplete) {
      const cleanId = maskedValue.replace(/\D/g, '');
      try {
        const taxpayer = await ordersApi.getHaciendaTaxpayer(watchedNationality, cleanId);
        if (taxpayer?.businessName) {
          form.setValue('businessName', taxpayer.businessName);
          onBusinessNameFromApi?.(true);
        } else {
          onBusinessNameFromApi?.(false);
        }
      } catch (error) {
        onBusinessNameFromApi?.(false);
        toast({
          title: t('common.error'),
          description: t('customers.noTaxpayerFound'),
          variant: "destructive",
        });
      }
    }
  };
  
  const handleClearId = () => {
    form.setValue('identification.number', '');
    form.setValue('businessName', '');
    setIdComplete(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('customers.personalData')}
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
        {/* Customer Type */}
        <div>
          <FormField
            control={form.control}
            name="customerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.customerType')}</FormLabel>
                <div className="flex gap-4">
                  {customerTypes?.map((type: any) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`customerType-${type.id}`}
                        value={type.id}
                        checked={field.value === type.id}
                        onChange={isEditing ? undefined : () => field.onChange(type.id)}
                        className={`form-radio ${isEditing ? "pointer-events-none opacity-50" : ""}`}
                        readOnly={isEditing}
                      />
                      <label htmlFor={`customerType-${type.id}`} className="text-sm">
                        {type.description}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.country')}</FormLabel>
                <Select onValueChange={isEditing ? undefined : field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={`${isEditing ? "bg-gray-100 dark:bg-gray-800 pointer-events-none" : ""}`}>
                      <SelectValue placeholder={t('customers.selectPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries?.map((country: any) => (
                      <SelectItem key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identification.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.identificationType')}</FormLabel>
                <Select onValueChange={isEditing ? undefined : (value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger className={`${isEditing ? "bg-gray-100 dark:bg-gray-800 pointer-events-none" : ""}`}>
                      <SelectValue placeholder={t('customers.selectPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredIdentificationTypes?.map((type: any) => (
                      <SelectItem key={type.typeId} value={type.typeId.toString()}>
                        {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identification.number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.identificationNumber')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder={t('customers.enterIdNumber')} 
                      value={field.value || ''}
                      onChange={(e) => handleIdNumberChange(e.target.value)}
                      readOnly={idComplete || isEditing}
                      className={(idComplete || isEditing) ? "bg-gray-100 dark:bg-gray-800 pr-10" : ""}
                    />
                    {idComplete && (
                      <ClearButton onClick={handleClearId} />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.fullName')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('customers.taxpayerName')} 
                      {...field} 
                      readOnly={isCostaRica || isEditing}
                      className={`${(isCostaRica || isEditing) ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.tradeName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('customers.companyName')} {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="clientGln"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('customers.clientGln')}</FormLabel>
              <FormControl>
                <Input placeholder={t('customers.enterGln')} {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </CardContent>
      </div>
    </Card>
  );
}