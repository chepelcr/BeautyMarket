import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "CRC", label: "CRC - Costa Rican Colón" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "MXN", label: "MXN - Mexican Peso" },
];

const paymentSettingsSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  cashOnDeliveryEnabled: z.boolean(),
  bankTransferEnabled: z.boolean(),
  bankAccountDetails: z.string().optional(),
});

export type PaymentSettingsFormValues = z.infer<typeof paymentSettingsSchema>;

export interface PaymentSettingsFormProps {
  userId?: string;
  organizationId?: string;
  initialData?: any;
  initialValues?: Partial<PaymentSettingsFormValues>;
  onSubmit?: (data: PaymentSettingsFormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function PaymentSettingsForm({
  initialValues,
  initialData,
  onSubmit,
  isLoading = false,
}: PaymentSettingsFormProps) {
  const effectiveInitialValues = initialValues || initialData;
  const { t } = useLanguage();
  const form = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      currency: effectiveInitialValues?.currency || "USD",
      cashOnDeliveryEnabled: effectiveInitialValues?.cashOnDeliveryEnabled ?? false,
      bankTransferEnabled: effectiveInitialValues?.bankTransferEnabled ?? false,
      bankAccountDetails: effectiveInitialValues?.bankAccountDetails || "",
    },
  });

  const bankTransferEnabled = form.watch("bankTransferEnabled");

  const handleSubmit = async (data: PaymentSettingsFormValues) => {
    await onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.payment.currency")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.payment.currencyPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t("settings.payment.currencyDesc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cashOnDeliveryEnabled"
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
                    {t("settings.payment.cashOnDelivery")}
                  </FormLabel>
                  <FormDescription>
                    {t("settings.payment.cashOnDeliveryDesc")}
                  </FormDescription>
                </div>
              </label>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankTransferEnabled"
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
                    {t("settings.payment.bankTransfer")}
                  </FormLabel>
                  <FormDescription>
                    {t("settings.payment.bankTransferDesc")}
                  </FormDescription>
                </div>
              </label>
            </FormItem>
          )}
        />

        {bankTransferEnabled && (
          <FormField
            control={form.control}
            name="bankAccountDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.payment.bankAccountDetails")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t("settings.payment.bankAccountDetailsPlaceholder")}
                    rows={4}
                  />
                </FormControl>
                <FormDescription>
                  {t("settings.payment.bankAccountDetailsDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {t("settings.payment.saving")}
              </>
            ) : (
              t("settings.payment.save")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
