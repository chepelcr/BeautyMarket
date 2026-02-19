import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Package, Eye } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct, Category } from "@/models";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface GeneralInfoSectionProps {
  form: UseFormReturn<InsertProduct>;
  categories: Category[];
  categoriesLoading: boolean;
}

const MEASUREMENT_UNITS = [
  { unitId: 1, code: "Sp", description: "Servicios Profesionales" },
  { unitId: 2, code: "m", description: "Metro" },
  { unitId: 3, code: "kg", description: "Kilogramo" },
  { unitId: 4, code: "s", description: "Segundo" },
  { unitId: 5, code: "A", description: "Ampere" },
  { unitId: 85, code: "Unid", description: "Unidad" },
  { unitId: 86, code: "Otros", description: "Otros" },
];

export function GeneralInfoSection({ form, categories, categoriesLoading }: GeneralInfoSectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

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
          >
            <Eye className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
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
                        <SelectItem key={category.id} value={category.id}>
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
        </div>

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
            name="unitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad de Medida *</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MEASUREMENT_UNITS.map((unit) => (
                      <SelectItem key={unit.unitId} value={unit.unitId.toString()}>
                        {unit.description} ({unit.code})
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
            name="isPackaged"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-8">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4"
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Vendido por empaque
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        {form.watch("unitId") === 86 && (
          <FormField
            control={form.control}
            name="commercialUnitMeasure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad Comercial</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Unidad comercial"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
      </div>
    </Card>
  );
}
