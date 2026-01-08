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

  // Fetch available components
  const { data: components, isLoading: isLoadingComponents } = useQuery<Component[]>({
    queryKey: ["components"],
    queryFn: async () => {
      const response = await fetch(buildPublicApiUrl("/components"));
      if (!response.ok) {
        throw new Error("Failed to fetch components");
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
        throw new Error(error.error || "Failed to create section");
      }

      return response.json();
    },
    onSuccess: (newSection) => {
      // Invalidate sections query
      queryClient.invalidateQueries({
        queryKey: ["sections", pageId],
      });

      toast({
        title: "Section created",
        description: `Section "${newSection.name}" has been created successfully`,
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
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedComponent || !sectionName) {
      toast({
        title: "Validation Error",
        description: "Please select a component and provide a section name",
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
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Select a component type and give your section a name
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="component">Component Type</Label>
            {isLoadingComponents ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
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
                  <SelectValue placeholder="Select a component type" />
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
            <Label htmlFor="name">Section Name</Label>
            <Input
              id="name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="e.g., Hero Section, Featured Products"
              required
            />
            <p className="text-sm text-gray-500">
              This name helps you identify the section in the page builder
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createSectionMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSectionMutation.isPending}>
              {createSectionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Section"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
