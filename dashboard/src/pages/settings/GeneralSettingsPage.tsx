import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";

const getGeneralSettingsSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, t("settings.general.nameRequired")),
  description: z.string().optional(),
  email: z.string().email(t("settings.general.emailInvalid")).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type GeneralSettingsFormValues = z.infer<ReturnType<typeof getGeneralSettingsSchema>>;

export default function GeneralSettingsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization, isLoading } = useDefaultOrganization(user?.id);

  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(getGeneralSettingsSchema(t)),
    values: {
      name: organization?.name || "",
      description: organization?.description || "",
      email: organization?.email || "",
      phone: organization?.phone || "",
      address: organization?.address || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: GeneralSettingsFormValues) => {
      if (!user?.id || !organization?.id) throw new Error("Missing user or organization");
      const response = await apiRequest(
        "PATCH",
        buildOrgApiUrl(user.id, organization.id, "/settings/general"),
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default-organization"] });
      toast({
        title: t("settings.general.saved"),
        description: t("settings.general.savedDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("settings.general.saveError"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: GeneralSettingsFormValues) => {
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("settings.general.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t("settings.general.subtitle")}
        </p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.general.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("settings.general.namePlaceholder")} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("settings.general.nameDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.general.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("settings.general.descriptionPlaceholder")}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("settings.general.descriptionDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.general.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("settings.general.emailPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("settings.general.emailDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.general.phone")}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t("settings.general.phonePlaceholder")} {...field} />
                    </FormControl>
                    <FormDescription>{t("settings.general.phoneDescription")}</FormDescription>
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
                  <FormLabel>{t("settings.general.address")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("settings.general.addressPlaceholder")}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("settings.general.addressDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateMutation.isPending || !form.formState.isDirty}
                className="min-w-[150px]"
              >
                {updateMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {t("settings.general.saving")}
                  </>
                ) : (
                  t("settings.general.save")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
