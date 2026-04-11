import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Package, Eye } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct, Category } from "@/models";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useAllMeasurementUnits } from "@/hooks/useDataApi";

interface GeneralInfoSectionProps {
  form: UseFormReturn<InsertProduct>;
  categories: Category[];
  categoriesLoading: boolean;
  disabled?: boolean;
  isInsertMode?: boolean;
  onGeneralInfoComplete?: () => void;
}

export function GeneralInfoSection({ form, categories, categoriesLoading, disabled = false }: GeneralInfoSectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true); // Always start expanded for general info
  const [showCustomUnit, setShowCustomUnit] = useState(false);

  // Fetch measurement units from data API (no parameters needed)
  const { data: measurementUnits, isLoading: measurementUnitsLoading } = useAllMeasurementUnits();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("products.form.generalInfo")}
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("products.form.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("products.form.namePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("products.form.description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("products.form.descriptionPlaceholder")}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("products.form.category")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("products.form.categoryPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        {t("products.form.loadingCategories")}
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        {t("products.form.noCategories")}
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.categoryId} value={category.categoryId}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Unit field - transforms between Select and Input for "Otros" */}
          {!showCustomUnit ? (
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("products.form.unit")}</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const selectedUnit = measurementUnits?.find(u => u.id.toString() === value);
                      field.onChange(parseInt(value));
                      
                      // Check if "Otros" was selected by code
                      if (selectedUnit?.code === 'Otros') {
                        setShowCustomUnit(true);
                        form.setValue('commercialUnitMeasure', '');
                      }
                    }} 
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={measurementUnitsLoading ? t('common.loading') : t("products.form.unitPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {measurementUnitsLoading ? (
                        <SelectItem value="loading" disabled>
                          {t('common.loading')}
                        </SelectItem>
                      ) : measurementUnits && measurementUnits.length > 0 ? (
                        measurementUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.description} ({unit.code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          {t("products.form.noUnits")}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="commercialUnitMeasure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("products.form.unit")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t("products.form.commercialUnitPlaceholder")}
                        {...field}
                        value={field.value || ""}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomUnit(false);
                          form.setValue('unitId', undefined);
                          form.setValue('commercialUnitMeasure', '');
                        }}
                        className="absolute right-0 top-0 h-full px-3 flex items-center justify-center hover:bg-accent/10 transition-colors rounded-r-md"
                        aria-label="Change unit selection"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {form.watch("unitId") === 86 && !showCustomUnit && (
          <FormField
            control={form.control}
            name="commercialUnitMeasure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("products.form.commercialUnit")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("products.form.commercialUnitPlaceholder")}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hasPackageInfo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t("products.form.hasPackageInfo")}
                  </FormLabel>
                  <FormDescription>
                    {t("products.form.hasPackageInfoDesc")}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trackInventory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t("products.inventory.trackInventory")}
                  </FormLabel>
                  <FormDescription>
                    {t("products.inventory.trackInventoryDesc")}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hasFiscalInfo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("products.form.hasFiscalInfo")}
                </FormLabel>
                <FormDescription>
                  {t("products.form.hasFiscalInfoDesc")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
      </div>
    </Card>
  );
}
