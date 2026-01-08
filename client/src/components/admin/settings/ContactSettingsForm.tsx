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
          <h3 className="text-lg font-semibold">Información de Contacto</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contacto@tutienda.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email de contacto público
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
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+506 1234-5678"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de teléfono de contacto
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
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Calle Principal, San José, Costa Rica"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Dirección física de tu negocio
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
                <FormLabel>Horario de Atención</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Lunes a Viernes: 9:00 AM - 6:00 PM&#10;Sábados: 10:00 AM - 2:00 PM"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Horarios en que atiendes a tus clientes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Redes Sociales</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="socialMedia.facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://facebook.com/tutienda"
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
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://instagram.com/tutienda"
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
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://twitter.com/tutienda"
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
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+506 1234-5678"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Número con código de país
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
