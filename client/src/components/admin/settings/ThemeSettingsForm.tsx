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

const fontFamilies = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Raleway", label: "Raleway" },
  { value: "Lato", label: "Lato" },
  { value: "Nunito", label: "Nunito" },
  { value: "Playfair Display", label: "Playfair Display" },
];

const themeSettingsSchema = z.object({
  primaryColor: z.string().min(4, "Color primario es requerido").regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal válido"),
  secondaryColor: z.string().min(4, "Color secundario es requerido").regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal válido"),
  fontFamily: z.string().optional(),
  logoUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  faviconUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
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
  const form = useForm<ThemeSettingsFormValues>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      primaryColor: initialValues?.primaryColor || "#e91e63",
      secondaryColor: initialValues?.secondaryColor || "#9c27b0",
      fontFamily: initialValues?.fontFamily || "Inter",
      logoUrl: initialValues?.logoUrl || "",
      faviconUrl: initialValues?.faviconUrl || "",
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
                <FormLabel>Color Primario</FormLabel>
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
                  Color principal de tu marca
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
                <FormLabel>Color Secundario</FormLabel>
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
                  Color secundario para acentos
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
              <FormLabel>Tipografía</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tipografía" />
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
                Fuente principal para tu sitio web
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
                    label="Logo"
                    folder="images/branding"
                  />
                </FormControl>
                <FormDescription>
                  Logo de tu tienda (opcional)
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
                    label="Favicon"
                    folder="images/branding"
                  />
                </FormControl>
                <FormDescription>
                  Icono de tu sitio web (opcional)
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
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
