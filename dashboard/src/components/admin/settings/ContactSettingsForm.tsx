import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const contactSettingsSchema = z.object({
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  businessHours: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().url("URL inválida").optional().or(z.literal("")),
    instagram: z.string().url("URL inválida").optional().or(z.literal("")),
    twitter: z.string().url("URL inválida").optional().or(z.literal("")),
    whatsapp: z.string().optional(),
  }).optional(),
});

export type ContactSettingsFormValues = z.infer<typeof contactSettingsSchema>;

interface ContactSettingsFormProps {
  initialValues?: Partial<ContactSettingsFormValues>;
  onSubmit: (data: ContactSettingsFormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function ContactSettingsForm({
  initialValues,
  onSubmit,
  isLoading = false,
}: ContactSettingsFormProps) {
  const { t } = useLanguage();
  const form = useForm<ContactSettingsFormValues>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: {
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      address: initialValues?.address || "",
      businessHours: initialValues?.businessHours || "",
      socialMedia: {
        facebook: initialValues?.socialMedia?.facebook || "",
        instagram: initialValues?.socialMedia?.instagram || "",
        twitter: initialValues?.socialMedia?.twitter || "",
        whatsapp: initialValues?.socialMedia?.whatsapp || "",
      },
    },
  });

  const handleSubmit = async (data: ContactSettingsFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("settings.contact.title")}</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.contact.email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("settings.contact.emailPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("settings.contact.emailDesc")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.contact.phone")}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t("settings.contact.phonePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("settings.contact.phoneDesc")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.contact.address")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("settings.contact.addressPlaceholder")}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t("settings.contact.addressDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.contact.businessHours")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("settings.contact.businessHoursPlaceholder")}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t("settings.contact.businessHoursDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("settings.contact.socialMedia")}</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="socialMedia.facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.contact.facebook")}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t("settings.contact.facebookPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialMedia.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.contact.instagram")}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t("settings.contact.instagramPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialMedia.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.contact.twitter")}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t("settings.contact.twitterPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialMedia.whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.contact.whatsapp")}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t("settings.contact.whatsappPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("settings.contact.whatsappDesc")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {t("settings.contact.saving")}
              </>
            ) : (
              t("settings.contact.save")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
