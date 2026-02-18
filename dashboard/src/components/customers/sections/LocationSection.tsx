import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface LocationSectionProps {
  form: any;
  states: any[];
  counties: any[];
  districts: any[];
  watchedStateId: number;
  watchedCountyId: number;
  handleStateChange: (value: string) => void;
  handleCountyChange: (value: string) => void;
  disabled?: boolean;
}

export function LocationSection({ 
  form, 
  states, 
  counties, 
  districts, 
  watchedStateId, 
  watchedCountyId, 
  handleStateChange, 
  handleCountyChange,
  disabled = false
}: LocationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const watchedNationality = form.watch("nationality");
  const isCostaRica = watchedNationality === "CR";
  const { t } = useLanguage();
  
  // Auto-expand when enabled (not disabled)
  useEffect(() => {
    if (!disabled) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [disabled]);
  
  // Reset location fields when nationality changes
  useEffect(() => {
    form.setValue("residence.stateId", 0);
    form.setValue("residence.countyId", 0);
    form.setValue("residence.districtId", 0);
  }, [watchedNationality, form]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('customers.address')}
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
        isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <CardContent className="space-y-4">
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCostaRica ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="residence.stateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.province')}</FormLabel>
                  <Select onValueChange={handleStateChange} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('customers.selectPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">{t('customers.selectProvince')}</SelectItem>
                      {states?.sort((a: any, b: any) => a.stateId - b.stateId).map((state: any) => (
                        <SelectItem key={state.stateId} value={state.stateId.toString()}>
                          {state.stateName}
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
              name="residence.countyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.canton')}</FormLabel>
                  <Select onValueChange={handleCountyChange} value={field.value?.toString()} disabled={!watchedStateId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('customers.selectPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">{t('customers.selectCanton')}</SelectItem>
                      {counties?.map((county: any) => (
                        <SelectItem key={county.countyId} value={county.countyId.toString()}>
                          {county.countyName}
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
              name="residence.districtId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.district')}</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()} disabled={!watchedCountyId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('customers.selectPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">{t('customers.selectDistrict')}</SelectItem>
                      {districts?.map((district: any) => (
                        <SelectItem key={district.districtId} value={district.districtId.toString()}>
                          {district.districtName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="residence.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('customers.otherSigns')}</FormLabel>
              <FormControl>
                <textarea
                  className="w-full p-2 border rounded-md bg-background text-foreground"
                  rows={3}
                  placeholder={t('customers.completeAddress')}
                  {...field}
                  value={field.value || ""}
                />
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