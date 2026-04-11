import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { COUNTRY_CODES } from "@/constants/customerTypes";

interface LocationSectionProps {
  form: any;
  states: any[];
  counties: any[];
  districts: any[];
  neighborhoods: any[];
  watchedStateId: number;
  watchedCountyId: number;
  watchedDistrictId: number;
  handleStateChange: (value: string) => void;
  handleCountyChange: (value: string) => void;
  handleDistrictChange: (value: string) => void;
  disabled?: boolean;
  statesLoading?: boolean;
  statesError?: boolean;
  refetchStates?: () => void;
  countiesLoading?: boolean;
  countiesError?: boolean;
  refetchCounties?: () => void;
  districtsLoading?: boolean;
  districtsError?: boolean;
  refetchDistricts?: () => void;
  neighborhoodsLoading?: boolean;
  neighborhoodsError?: boolean;
  refetchNeighborhoods?: () => void;
}

export function LocationSection({ 
  form, 
  states, 
  counties, 
  districts,
  neighborhoods,
  watchedStateId, 
  watchedCountyId,
  watchedDistrictId,
  handleStateChange, 
  handleCountyChange,
  handleDistrictChange,
  disabled = false,
  statesLoading,
  statesError,
  refetchStates,
  countiesLoading,
  countiesError,
  refetchCounties,
  districtsLoading,
  districtsError,
  refetchDistricts,
  neighborhoodsLoading,
  neighborhoodsError,
  refetchNeighborhoods
}: LocationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const watchedNationality = form.watch("nationality");
  const isCostaRica = watchedNationality === COUNTRY_CODES.COSTA_RICA;
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
    form.setValue("residence.neighborhoodId", 0);
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
        {/* Only show state/county/district/neighborhood selectors for Costa Rica */}
        {isCostaRica && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="residence.stateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.province')}</FormLabel>
                  {statesError ? (
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
                          onClick={() => refetchStates?.()}
                          className="h-auto p-0"
                        >
                          {t('common.retry')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Select 
                      onValueChange={handleStateChange} 
                      value={field.value != null ? field.value.toString() : "0"}
                      disabled={statesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={statesLoading ? "bg-muted" : ""}>
                          <SelectValue placeholder={statesLoading ? t('common.loading') : t('customers.selectPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">{t('customers.selectProvince')}</SelectItem>
                        {states?.sort((a: any, b: any) => a.state_id - b.state_id).map((state: any) => (
                          <SelectItem key={state.state_id} value={state.state_id.toString()}>
                            {state.state_name}
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
              name="residence.countyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.canton')}</FormLabel>
                  {countiesError ? (
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
                          onClick={() => refetchCounties?.()}
                          className="h-auto p-0"
                        >
                          {t('common.retry')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Select 
                      onValueChange={handleCountyChange} 
                      value={field.value != null ? field.value.toString() : "0"} 
                      disabled={!watchedStateId || watchedStateId === 0 || countiesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={(countiesLoading || !watchedStateId || watchedStateId === 0) ? "bg-muted" : ""}>
                          <SelectValue placeholder={countiesLoading ? t('common.loading') : t('customers.selectPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">{t('customers.selectCanton')}</SelectItem>
                        {counties?.map((county: any) => (
                          <SelectItem key={county.county_id} value={county.county_id.toString()}>
                            {county.county_name}
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
              name="residence.districtId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.district')}</FormLabel>
                  {districtsError ? (
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
                          onClick={() => refetchDistricts?.()}
                          className="h-auto p-0"
                        >
                          {t('common.retry')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Select 
                      onValueChange={handleDistrictChange} 
                      value={field.value != null ? field.value.toString() : "0"} 
                      disabled={!watchedCountyId || watchedCountyId === 0 || districtsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={(districtsLoading || !watchedCountyId || watchedCountyId === 0) ? "bg-muted" : ""}>
                          <SelectValue placeholder={districtsLoading ? t('common.loading') : t('customers.selectPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">{t('customers.selectDistrict')}</SelectItem>
                        {districts?.map((district: any) => (
                          <SelectItem key={district.district_id} value={district.district_id.toString()}>
                            {district.district_name}
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
              name="residence.neighborhoodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.neighborhood')}</FormLabel>
                  {neighborhoodsError ? (
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
                          onClick={() => refetchNeighborhoods?.()}
                          className="h-auto p-0"
                        >
                          {t('common.retry')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value != null ? field.value.toString() : "0"} 
                      disabled={!watchedDistrictId || watchedDistrictId === 0 || neighborhoodsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={(neighborhoodsLoading || !watchedDistrictId || watchedDistrictId === 0) ? "bg-muted" : ""}>
                          <SelectValue placeholder={neighborhoodsLoading ? t('common.loading') : t('customers.selectPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">{t('customers.selectNeighborhood')}</SelectItem>
                        {neighborhoods?.map((neighborhood: any) => (
                          <SelectItem key={neighborhood.neighborhood_id} value={neighborhood.neighborhood_id.toString()}>
                            {neighborhood.neighborhood_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Address field - always shown */}
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