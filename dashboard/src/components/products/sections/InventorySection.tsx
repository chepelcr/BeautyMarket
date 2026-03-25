import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Package2, Eye } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InsertProduct } from "@/models";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface InventorySectionProps {
  form: UseFormReturn<InsertProduct>;
  disabled?: boolean;
}

export function InventorySection({ form, disabled = false }: InventorySectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(!disabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            {t("products.inventory.title")}
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

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("products.inventory.sku")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("products.inventory.skuPlaceholder")}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  {t("products.inventory.skuDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitsPerBox"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("products.form.unitsPerBox")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                  />
                </FormControl>
                <FormDescription>
                  {t("products.form.unitsPerBoxDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("products.inventory.stockQuantity")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={!form.watch("trackInventory")}
                  />
                </FormControl>
                <FormDescription>
                  {t("products.inventory.stockQuantityDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("products.inventory.lowStockThreshold")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                    disabled={!form.watch("trackInventory")}
                  />
                </FormControl>
                <FormDescription>
                  {t("products.inventory.lowStockThresholdDesc")}
                </FormDescription>
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
