import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionContentFields } from "./SectionContentFields";
import type { PageSection, SectionContent, ContentInput } from "./types";

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  content: z.record(z.string()),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionEditorProps {
  userId: string;
  organizationId: string;
  pageId: string;
  sectionId: string;
  section: PageSection;
  onSave?: () => void;
  onCancel?: () => void;
}

export function SectionEditor({
  userId,
  organizationId,
  pageId,
  sectionId,
  section,
  onSave,
  onCancel,
}: SectionEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Fetch section content
  const { data: content, isLoading: isLoadingContent } = useQuery<SectionContent[]>({
    queryKey: ["sectionContent", sectionId],
    queryFn: async () => {
      const response = await fetch(
        buildOrgApiUrl(userId, organizationId, `/pages/${pageId}/sections/${sectionId}/content`)
      );
      if (!response.ok) {
        throw new Error(t('sections.errors.fetchContentFailed'));
      }
      return response.json();
    },
  });

  // Initialize form with default values
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: section.name,
      content: {},
    },
  });

  // Update form when content is loaded
  useEffect(() => {
    if (content) {
      const contentValues = content.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);

      form.reset({
        name: section.name,
        content: contentValues,
      });
    }
  }, [content, section.name, form]);

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await fetch(
        buildOrgApiUrl(userId, organizationId, `/pages/${pageId}/sections/${sectionId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('sections.errors.updateFailed'));
      }

      return response.json();
    },
  });

  // Bulk upsert content mutation
  const updateContentMutation = useMutation({
    mutationFn: async (contentData: ContentInput[]) => {
      const response = await fetch(
        buildOrgApiUrl(userId, organizationId, `/pages/${pageId}/sections/${sectionId}/content/bulk`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: contentData }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('sections.errors.updateContentFailed'));
      }

      return response.json();
    },
  });

  const handleSubmit = async (values: SectionFormValues) => {
    try {
      // Update section name if changed
      if (values.name !== section.name) {
        await updateSectionMutation.mutateAsync({ name: values.name });
      }

      // Prepare content data for bulk upsert
      if (content) {
        const contentData: ContentInput[] = content.map((item) => ({
          key: item.key,
          value: values.content[item.key] || item.value,
          valueType: item.valueType,
          displayName: item.displayName,
          description: item.description,
          componentId: item.componentId,
          sortOrder: item.sortOrder,
        }));

        await updateContentMutation.mutateAsync(contentData);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["sections", pageId] });
      queryClient.invalidateQueries({ queryKey: ["sectionContent", sectionId] });

      toast({
        title: t('sections.toast.updated'),
        description: t('sections.toast.updatedDescription'),
      });

      onSave?.();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isSubmitting = updateSectionMutation.isPending || updateContentMutation.isPending;

  if (isLoadingContent) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.editor.title')}</CardTitle>
        <CardDescription>
          {t('sections.fields.sectionType')}: <span className="font-medium">{section.sectionType}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Section Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sections.fields.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('sections.fields.namePlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic Content Fields */}
            {content && content.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('sections.editor.contentTitle')}</h3>
                <SectionContentFields
                  content={content}
                  control={form.control}
                  userId={userId}
                  organizationId={organizationId}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('sections.editor.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('sections.editor.save')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
