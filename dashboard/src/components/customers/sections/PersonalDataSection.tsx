import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { User, Eye } from "lucide-react";
import { dataApiClient } from "@/services/data-api";
import { useToast } from "@/hooks/use-toast";
import { ClearButton } from "@/components/common/ClearButton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CUSTOMER_TYPES, IDENTIFICATION_CODES, COUNTRY_CODES } from "@/constants/customerTypes";

interface PersonalDataSectionProps {
  form: any;
  customerTypes: any[];
  countries: any[];
  identificationTypes: any[];
  isEditing?: boolean;
  customerStatus?: number;
  fieldErrors?: any;
  onBusinessNameFromApi?: (hasBusinessName: boolean) => void;
  identificationTypesLoading?: boolean;
  identificationTypesError?: boolean;
  refetchIdentificationTypes?: () => void;
  customerTypesLoading?: boolean;
  customerTypesError?: boolean;
  refetchCustomerTypes?: () => void;
  countriesLoading?: boolean;
  countriesError?: boolean;
  refetchCountries?: () => void;
}

const applyIdMask = (value: string, code: string) => {
  const numbers = value.replace(/\D/g, '');
  
  // 01 - Cédula Física: 9 digits, format X-XXXX-XXXX
  if (code === IDENTIFICATION_CODES.CEDULA_FISICA) {
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 5) return numbers.replace(/(\d{1})(\d+)/, '$1-$2');
    return numbers.replace(/(\d{1})(\d{4})(\d+)/, '$1-$2-$3');
  }
  
  // 02 - Cédula Jurídica: 10 digits, format X-XXX-XXXXXX
  if (code === IDENTIFICATION_CODES.CEDULA_JURIDICA) {
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 4) return numbers.replace(/(\d{1})(\d+)/, '$1-$2');
    return numbers.replace(/(\d{1})(\d{3})(\d+)/, '$1-$2-$3');
  }
  
  // 03 - DIMEX: 11-12 digits, no formatting
  // 04 - NITE: 10 digits, no formatting
  // 05 - Pasaporte: Variable length, no formatting
  return numbers;
};

const validateIdLength = (value: string, code: string) => {
  const numbers = value.replace(/\D/g, '');
  
  if (code === IDENTIFICATION_CODES.CEDULA_FISICA) return numbers.length === 9;
  if (code === IDENTIFICATION_CODES.CEDULA_JURIDICA) return numbers.length === 10;
  if (code === IDENTIFICATION_CODES.DIMEX) return numbers.length >= 11 && numbers.length <= 12;
  if (code === IDENTIFICATION_CODES.NITE) return numbers.length === 10;
  if (code === IDENTIFICATION_CODES.PASAPORTE) return numbers.length >= 6; // Passports typically 6-20 characters
  
  return true;
};

export function PersonalDataSection({ form, customerTypes, countries, identificationTypes, isEditing = false, customerStatus, onBusinessNameFromApi, identificationTypesLoading, identificationTypesError, refetchIdentificationTypes, customerTypesLoading, customerTypesError, refetchCustomerTypes, countriesLoading, countriesError, refetchCountries }: PersonalDataSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();
  const watchedNationality = form.watch("nationality");
  const watchedCustomerType = form.watch("customerType");
  const watchedIdCode = form.watch("identification.code");
  const watchedIdType = form.watch("identification.type");
  const isCostaRica = watchedNationality === COUNTRY_CODES.COSTA_RICA;
  
  // Allow editing critical fields if customer status is 0 (pending)
  const isPendingCustomer = customerStatus === 0;
  const canEditCriticalFields = !isEditing || isPendingCustomer;
  
  const getFilteredIdentificationTypes = () => {
    if (!identificationTypes) return [];
    
    // If country is not Costa Rica, only show Passport (05)
    if (watchedNationality !== COUNTRY_CODES.COSTA_RICA) {
      return identificationTypes.filter((type: any) => type.code === IDENTIFICATION_CODES.PASAPORTE);
    }
    
    // Costa Rica - filter by customer type
    if (watchedCustomerType === CUSTOMER_TYPES.PERSONA) {
      // Persona: Physical ID (01), DIMEX (03), NITE (04), Passport (05)
      return identificationTypes.filter((type: any) => 
        [IDENTIFICATION_CODES.CEDULA_FISICA, IDENTIFICATION_CODES.DIMEX, IDENTIFICATION_CODES.NITE, IDENTIFICATION_CODES.PASAPORTE].includes(type.code)
      );
    }
    
    if (watchedCustomerType === CUSTOMER_TYPES.EMPRESA) {
      // Empresa: Legal Entity ID (02), Passport (05)
      return identificationTypes.filter((type: any) => 
        [IDENTIFICATION_CODES.CEDULA_JURIDICA, IDENTIFICATION_CODES.PASAPORTE].includes(type.code)
      );
    }
    
    return identificationTypes;
  };
  
  const filteredIdentificationTypes = getFilteredIdentificationTypes();
  
  // Auto-select identification type when filters change
  React.useEffect(() => {
    if (filteredIdentificationTypes.length > 0) {
      const currentType = form.getValues("identification.type");
      const isCurrentTypeValid = filteredIdentificationTypes.some((type: any) => type.id === currentType);
      
      if (!isCurrentTypeValid) {
        const newType = watchedNationality !== COUNTRY_CODES.COSTA_RICA 
          ? filteredIdentificationTypes.find((type: any) => type.code === IDENTIFICATION_CODES.PASAPORTE)
          : filteredIdentificationTypes[0];
        
        if (newType) {
          form.setValue("identification.type", newType.id);
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
        const taxpayer = await dataApiClient.getTaxpayerInfo({ iso_code: watchedNationality, identification: cleanId });
        if (taxpayer?.name) {
          form.setValue('businessName', taxpayer.name);
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
                {customerTypesError ? (
                  <div className="space-y-2">
                    <div className="text-sm text-destructive flex items-center gap-2">
                      {t('common.errorLoadingData')}
                      <Button 
                        type="button"
                        variant="link" 
                        size="sm" 
                        onClick={() => refetchCustomerTypes?.()}
                        className="h-auto p-0"
                      >
                        {t('common.retry')}
                      </Button>
                    </div>
                  </div>
                ) : customerTypesLoading ? (
                  <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
                ) : (
                  <div className="flex gap-4">
                    {customerTypes?.map((type: any) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`customerType-${type.id}`}
                          value={type.id}
                          checked={field.value === type.id}
                          onChange={canEditCriticalFields ? () => field.onChange(type.id) : undefined}
                          className={`form-radio ${!canEditCriticalFields ? "pointer-events-none opacity-50" : ""}`}
                          readOnly={!canEditCriticalFields}
                        />
                        <label htmlFor={`customerType-${type.id}`} className="text-sm">
                          {type.description}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
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
                {countriesError ? (
                  <div className="space-y-2">
                    <Select disabled>
                      <FormControl>
                        <SelectTrigger className="bg-muted">
                          <SelectValue placeholder={t('common.error')} />
                        </SelectTrigger>
                      </FormControl>
                    </Select>
                    <div className="text-sm text-destructive flex items-center gap-2">
                      {t('common.errorLoadingData')}
                      <Button 
                        type="button"
                        variant="link" 
                        size="sm" 
                        onClick={() => refetchCountries?.()}
                        className="h-auto p-0"
                      >
                        {t('common.retry')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Select 
                    onValueChange={canEditCriticalFields ? field.onChange : undefined} 
                    value={field.value || "188"}
                    disabled={countriesLoading || !canEditCriticalFields}
                  >
                    <FormControl>
                      <SelectTrigger className={`${(!canEditCriticalFields || countriesLoading) ? "bg-muted pointer-events-none" : ""}`}>
                        <SelectValue placeholder={countriesLoading ? t('common.loading') : t('customers.selectPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries?.map((country: any) => (
                        <SelectItem key={country.iso_code} value={country.iso_code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                {identificationTypesError ? (
                  <div className="space-y-2">
                    <Select disabled>
                      <FormControl>
                        <SelectTrigger className="bg-muted">
                          <SelectValue placeholder={t('common.error')} />
                        </SelectTrigger>
                      </FormControl>
                    </Select>
                    <div className="text-sm text-destructive flex items-center gap-2">
                      {t('common.errorLoadingData')}
                      <Button 
                        type="button"
                        variant="link" 
                        size="sm" 
                        onClick={() => refetchIdentificationTypes?.()}
                        className="h-auto p-0"
                      >
                        {t('common.retry')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Select 
                    onValueChange={canEditCriticalFields ? (value) => field.onChange(parseInt(value)) : undefined} 
                    value={field.value ? field.value.toString() : undefined}
                    disabled={identificationTypesLoading || !canEditCriticalFields}
                  >
                    <FormControl>
                      <SelectTrigger className={`${(!canEditCriticalFields || identificationTypesLoading) ? "bg-muted pointer-events-none" : ""}`}>
                        <SelectValue placeholder={identificationTypesLoading ? t('common.loading') : t('customers.selectPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredIdentificationTypes?.map((type: any) => (
                        type.id != null && (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.description}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                      readOnly={idComplete || !canEditCriticalFields}
                      className={(idComplete || !canEditCriticalFields) ? "bg-muted pr-10" : ""}
                    />
                    {idComplete && canEditCriticalFields && (
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
                      className={`${(isCostaRica || isEditing) ? "bg-muted" : ""}`}
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