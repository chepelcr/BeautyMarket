import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useLanguage } from "@/contexts/LanguageContext";

const shippingSettingsSchema = z.object({
  freeShippingThreshold: z.number().min(0, "Must be 0 or greater"),
  defaultShippingCost: z.number().min(0, "Must be 0 or greater"),
  enableLocalPickup: z.boolean(),
  enableCorreosShipping: z.boolean(),
  enableUberFlash: z.boolean(),
});

export type ShippingSettingsFormValues = z.infer<typeof shippingSettingsSchema>;

export interface ShippingSettingsFormProps {
  userId?: string;
  organizationId?: string;
  initialData?: any;
  initialValues?: Partial<ShippingSettingsFormValues>;
  onSubmit?: (data: ShippingSettingsFormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function ShippingSettingsForm({
  initialValues,
  initialData,
  onSubmit,
  isLoading = false,
}: ShippingSettingsFormProps) {
  const { t } = useLanguage();
  const effectiveInitialValues = initialValues || initialData;
  const form = useForm<ShippingSettingsFormValues>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      freeShippingThreshold: effectiveInitialValues?.freeShippingThreshold ?? 0,
      defaultShippingCost: effectiveInitialValues?.defaultShippingCost ?? 0,
      enableLocalPickup: effectiveInitialValues?.enableLocalPickup ?? false,
      enableCorreosShipping: effectiveInitialValues?.enableCorreosShipping ?? false,
      enableUberFlash: effectiveInitialValues?.enableUberFlash ?? false,
    },
  });

  const handleSubmit = async (data: ShippingSettingsFormValues) => {
    await onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="freeShippingThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.shipping.freeShippingThreshold")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  {t("settings.shipping.freeShippingThresholdDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defaultShippingCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.shipping.defaultShippingCost")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  {t("settings.shipping.defaultShippingCostDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="enableLocalPickup"
          render={({ field }) => (
            <FormItem>
              <label className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    {t("settings.shipping.enableLocalPickup")}
                  </FormLabel>
                  <FormDescription>
                    {t("settings.shipping.enableLocalPickupDesc")}
                  </FormDescription>
                </div>
              </label>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enableCorreosShipping"
          render={({ field }) => (
            <FormItem>
              <label className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    {t("settings.shipping.enableCorreosShipping")}
                  </FormLabel>
                  <FormDescription>
                    {t("settings.shipping.enableCorreosShippingDesc")}
                  </FormDescription>
                </div>
              </label>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enableUberFlash"
          render={({ field }) => (
            <FormItem>
              <label className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    {t("settings.shipping.enableUberFlash")}
                  </FormLabel>
                  <FormDescription>
                    {t("settings.shipping.enableUberFlashDesc")}
                  </FormDescription>
                </div>
              </label>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {t("settings.shipping.saving")}
              </>
            ) : (
              t("settings.shipping.save")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
