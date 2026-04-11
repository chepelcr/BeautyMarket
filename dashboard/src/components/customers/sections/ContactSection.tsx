import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Phone, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { COUNTRY_CODES } from "@/constants/customerTypes";

interface ContactSectionProps {
  form: any;
  countries: any[];
  fieldErrors?: any;
  disabled?: boolean;
}

export function ContactSection({ form, countries, fieldErrors, disabled = false }: ContactSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();
  // Auto-expand when enabled (not disabled)
  useEffect(() => {
    if (!disabled) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [disabled]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {t('customers.contact')}
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
        isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>{t('customers.phoneNumber')}</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="phone.countryCode"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || COUNTRY_CODES.COSTA_RICA}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.map((country: any) => (
                        <SelectItem key={country.iso_code} value={country.iso_code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormField
                control={form.control}
                name="phone.number"
                render={({ field }) => (
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t('customers.phoneNumber')}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                )}
              />
            </div>
          </FormItem>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.emailAddress')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('customers.emailAddress')} {...field} value={field.value || ""} className={fieldErrors?.email ? "border-red-500" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        </CardContent>
      </div>
    </Card>
  );
}