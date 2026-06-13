import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ImageUpload } from "@/components/image-upload";
import { useLanguage } from "@/contexts/LanguageContext";

const fontFamilies = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Raleway", label: "Raleway" },
  { value: "Lato", label: "Lato" },
  { value: "Nunito", label: "Nunito" },
  { value: "Playfair Display", label: "Playfair Display" },
];

const iconOptions = [
  { value: "Sparkles", label: "Sparkles" },
  { value: "Leaf", label: "Leaf" },
  { value: "ShieldCheck", label: "Shield Check" },
  { value: "Heart", label: "Heart" },
  { value: "Award", label: "Award" },
  { value: "Users", label: "Users" },
  { value: "ShoppingBag", label: "Shopping Bag" },
  { value: "Package", label: "Package" },
  { value: "Box", label: "Box" },
  { value: "Image", label: "Image" },
];

const themeSettingsSchema = z.object({
  primaryColor: z.string().min(4, "Color primario es requerido").regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal válido"),
  secondaryColor: z.string().min(4, "Color secundario es requerido").regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal válido"),
  fontFamily: z.string().optional(),
  logoUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  faviconUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  loadingIcon: z.string().optional(),
  productFallbackIcon: z.string().optional(),
});

export type ThemeSettingsFormValues = z.infer<typeof themeSettingsSchema>;

interface ThemeSettingsFormProps {
  initialValues?: Partial<ThemeSettingsFormValues>;
  onSubmit: (data: ThemeSettingsFormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function ThemeSettingsForm({
  initialValues,
  onSubmit,
  isLoading = false,
}: ThemeSettingsFormProps) {
  const { t } = useLanguage();
  const form = useForm<ThemeSettingsFormValues>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      primaryColor: initialValues?.primaryColor || "#e91e63",
      secondaryColor: initialValues?.secondaryColor || "#9c27b0",
      fontFamily: initialValues?.fontFamily || "Inter",
      logoUrl: initialValues?.logoUrl || "",
      faviconUrl: initialValues?.faviconUrl || "",
      loadingIcon: initialValues?.loadingIcon || "Sparkles",
      productFallbackIcon: initialValues?.productFallbackIcon || "Sparkles",
    },
  });

  const handleSubmit = async (data: ThemeSettingsFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.theme.primaryColor")}</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      {...field}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="#e91e63"
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  {t("settings.theme.primaryColorDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.theme.secondaryColor")}</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      {...field}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="#9c27b0"
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  {t("settings.theme.secondaryColorDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fontFamily"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.theme.fontFamily")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.theme.fontFamilyPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t("settings.theme.fontFamilyDesc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUpload
                    value={field.value || ""}
                    onChange={field.onChange}
                    label={t("settings.theme.logo")}
                    folder="images/branding"
                  />
                </FormControl>
                <FormDescription>
                  {t("settings.theme.logoDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="faviconUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUpload
                    value={field.value || ""}
                    onChange={field.onChange}
                    label={t("settings.theme.favicon")}
                    folder="images/branding"
                  />
                </FormControl>
                <FormDescription>
                  {t("settings.theme.faviconDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="loadingIcon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.theme.loadingIcon")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("settings.theme.loadingIconPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t("settings.theme.loadingIconDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productFallbackIcon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.theme.productFallbackIcon")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("settings.theme.productFallbackIconPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t("settings.theme.productFallbackIconDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                {t("settings.theme.saving")}
              </>
            ) : (
              t("settings.theme.save")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
