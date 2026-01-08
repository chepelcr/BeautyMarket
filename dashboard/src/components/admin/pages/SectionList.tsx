import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionEditor } from "./SectionEditor";
import type { PageSection } from "./types";

interface SectionListProps {
  userId: string;
  organizationId: string;
  pageId: string;
  sections: PageSection[];
}

export function SectionList({
  userId,
  organizationId,
  pageId,
  sections,
}: SectionListProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      const response = await fetch(
        buildOrgApiUrl(userId, organizationId, `/pages/${pageId}/sections/${sectionId}`),
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('sections.errors.deleteFailed'));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", pageId] });
      toast({
        title: t('sections.toast.deleted'),
        description: t('sections.toast.deletedDescription'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle section active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ sectionId, isActive }: { sectionId: string; isActive: boolean }) => {
      const response = await fetch(
        buildOrgApiUrl(userId, organizationId, `/pages/${pageId}/sections/${sectionId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('sections.errors.updateFailed'));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", pageId] });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update sort order mutation
  const updateSortOrderMutation = useMutation({
    mutationFn: async ({ sectionId, sortOrder }: { sectionId: string; sortOrder: number }) => {
      const response = await fetch(
        buildOrgApiUrl(userId, organizationId, `/pages/${pageId}/sections/${sectionId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sortOrder }),
        }
      );

      if (!response.ok) {
        throw new Error(t('sections.errors.updateOrderFailed'));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", pageId] });
    },
  });

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentSection = sections[index];
    const previousSection = sections[index - 1];

    updateSortOrderMutation.mutate({ sectionId: currentSection.id, sortOrder: previousSection.sortOrder });
    updateSortOrderMutation.mutate({ sectionId: previousSection.id, sortOrder: currentSection.sortOrder });
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const currentSection = sections[index];
    const nextSection = sections[index + 1];

    updateSortOrderMutation.mutate({ sectionId: currentSection.id, sortOrder: nextSection.sortOrder });
    updateSortOrderMutation.mutate({ sectionId: nextSection.id, sortOrder: currentSection.sortOrder });
  };

  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sortedSections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{t('sections.noSections')}</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {sortedSections.map((section, index) => (
        <AccordionItem
          key={section.id}
          value={section.id}
          className="border rounded-lg"
        >
          <div className="flex items-center gap-2 px-4 py-2">
            {/* Drag handle */}
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0 || updateSortOrderMutation.isPending}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleMoveDown(index)}
                disabled={index === sections.length - 1 || updateSortOrderMutation.isPending}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Section info */}
            <AccordionTrigger className="flex-1 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{section.name}</div>
                  <div className="text-sm text-gray-500">
                    <Badge variant="outline" className="mr-2">
                      {section.sectionType}
                    </Badge>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Active toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={section.isActive}
                  onCheckedChange={(checked) =>
                    toggleActiveMutation.mutate({
                      sectionId: section.id,
                      isActive: checked,
                    })
                  }
                />
                {section.isActive ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Edit button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setEditingSection(editingSection === section.id ? null : section.id)
                }
              >
                <Edit className="w-4 h-4" />
              </Button>

              {/* Delete button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('sections.dialog.deleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('sections.dialog.deleteDescription', { name: section.name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteSectionMutation.mutate(section.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Section editor (shown when editing) */}
          {editingSection === section.id && (
            <AccordionContent>
              <div className="px-4 pb-4">
                <SectionEditor
                  userId={userId}
                  organizationId={organizationId}
                  pageId={pageId}
                  sectionId={section.id}
                  section={section}
                  onSave={() => setEditingSection(null)}
                  onCancel={() => setEditingSection(null)}
                />
              </div>
            </AccordionContent>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}
