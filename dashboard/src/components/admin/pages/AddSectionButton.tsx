import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { buildOrgApiUrl, buildPublicApiUrl } from "@/lib/apiUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Component, CreateSectionInput } from "./types";

interface AddSectionButtonProps {
  userId: string;
  organizationId: string;
  pageId: string;
  onSectionAdded?: () => void;
}

export function AddSectionButton({
  userId,
  organizationId,
  pageId,
  onSectionAdded,
}: AddSectionButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>("");
  const [sectionName, setSectionName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Fetch available components
  const { data: components, isLoading: isLoadingComponents } = useQuery<Component[]>({
    queryKey: ["components"],
    queryFn: async () => {
      const response = await fetch(buildPublicApiUrl("/components"));
      if (!response.ok) {
        throw new Error(t('sections.errors.fetchComponentsFailed'));
      }
      return response.json();
    },
  });

  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (data: CreateSectionInput) => {
      const response = await fetch(
        buildOrgApiUrl(userId, organizationId, `/pages/${pageId}/sections`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('sections.errors.createFailed'));
      }

      return response.json();
    },
    onSuccess: (newSection) => {
      // Invalidate sections query
      queryClient.invalidateQueries({
        queryKey: ["sections", pageId],
      });

      toast({
        title: t('sections.toast.created'),
        description: t('sections.toast.createdDescription', { name: newSection.name }),
      });

      // Reset form
      setSelectedComponent("");
      setSectionName("");
      setOpen(false);

      // Callback
      onSectionAdded?.();
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedComponent || !sectionName) {
      toast({
        title: t('sections.errors.validation'),
        description: t('sections.errors.validationDescription'),
        variant: "destructive",
      });
      return;
    }

    const component = components?.find((c) => c.id === selectedComponent);
    if (!component) {
      return;
    }

    createSectionMutation.mutate({
      sectionType: component.type,
      name: sectionName,
      isActive: true,
      sortOrder: 0, // Backend should handle auto-incrementing
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {t('sections.addSection')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('sections.dialog.addTitle')}</DialogTitle>
          <DialogDescription>
            {t('sections.dialog.addDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="component">{t('sections.fields.componentType')}</Label>
            {isLoadingComponents ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <Select
                value={selectedComponent}
                onValueChange={(value) => {
                  setSelectedComponent(value);
                  // Auto-generate section name from component display name if empty
                  if (!sectionName) {
                    const component = components?.find((c) => c.id === value);
                    if (component) {
                      setSectionName(component.displayName);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('sections.fields.componentTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {components?.map((component) => (
                    <SelectItem key={component.id} value={component.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{component.displayName}</span>
                        {component.description && (
                          <span className="text-xs text-gray-500">
                            {component.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedComponent && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {components?.find((c) => c.id === selectedComponent)?.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('sections.fields.name')}</Label>
            <Input
              id="name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder={t('sections.fields.namePlaceholder')}
              required
            />
            <p className="text-sm text-gray-500">
              {t('sections.fields.nameHelp')}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createSectionMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createSectionMutation.isPending}>
              {createSectionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('sections.dialog.creating')}
                </>
              ) : (
                t('sections.dialog.create')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
