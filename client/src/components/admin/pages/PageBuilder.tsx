import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { PageList } from "./PageList";
import { SectionList } from "./SectionList";
import { AddSectionButton } from "./AddSectionButton";
import type { Page, PageSection } from "./types";

interface PageBuilderProps {
  userId: string;
  organizationId: string;
}

export function PageBuilder({ userId, organizationId }: PageBuilderProps) {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pages
  const { data: pages, isLoading: isLoadingPages } = useQuery<Page[]>({
    queryKey: ["pages", organizationId],
    queryFn: async () => {
      const response = await fetch(buildOrgApiUrl(userId, organizationId, "/pages"));
      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }
      return response.json();
    },
  });

  // Fetch sections for selected page
  const { data: sections, isLoading: isLoadingSections } = useQuery<PageSection[]>({
    queryKey: ["sections", selectedPageId],
    queryFn: async () => {
      if (!selectedPageId) return [];
      const response = await fetch(
        buildOrgApiUrl(userId, organizationId, `/pages/${selectedPageId}/sections`)
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }
      return response.json();
    },
    enabled: !!selectedPageId,
  });

  // Get selected page
  const selectedPage = pages?.find((p) => p.id === selectedPageId);

  // Auto-select first page if none selected
  if (!selectedPageId && pages && pages.length > 0) {
    setSelectedPageId(pages[0].id);
  }

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (data: { title?: string; isActive?: boolean }) => {
      if (!selectedPageId) throw new Error("No page selected");

      const response = await fetch(
        buildOrgApiUrl(userId, organizationId, `/pages/${selectedPageId}`),
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
        throw new Error(error.error || "Failed to update page");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", organizationId] });
      toast({
        title: "Page updated",
        description: "Page has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePageTitleChange = (title: string) => {
    if (selectedPage && title !== selectedPage.title) {
      updatePageMutation.mutate({ title });
    }
  };

  const handlePageActiveToggle = (isActive: boolean) => {
    if (selectedPage && isActive !== selectedPage.isActive) {
      updatePageMutation.mutate({ isActive });
    }
  };

  if (isLoadingPages) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Sidebar - Page List */}
      <Card className="w-64 flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Pages
          </CardTitle>
          <CardDescription>Select a page to edit</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <PageList
            pages={pages || []}
            selectedPageId={selectedPageId}
            onPageSelect={setSelectedPageId}
          />
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {selectedPage ? (
          <>
            {/* Top Bar - Page Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="page-title" className="text-sm text-gray-500">
                          Page Title
                        </Label>
                        <Input
                          id="page-title"
                          value={selectedPage.title}
                          onChange={(e) => handlePageTitleChange(e.target.value)}
                          onBlur={(e) => handlePageTitleChange(e.target.value)}
                          className="text-xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Type: <span className="font-medium">{selectedPage.type}</span></span>
                      <span>•</span>
                      <span>Slug: <span className="font-medium">/{selectedPage.slug}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="page-active">Active</Label>
                      <Switch
                        id="page-active"
                        checked={selectedPage.isActive}
                        onCheckedChange={handlePageActiveToggle}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Section List */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Page Sections</CardTitle>
                    <CardDescription>
                      {sections?.length || 0} section{sections?.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="flex-1 overflow-y-auto pt-4">
                {isLoadingSections ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                  </div>
                ) : (
                  <SectionList
                    userId={userId}
                    organizationId={organizationId}
                    pageId={selectedPageId}
                    sections={sections || []}
                  />
                )}
              </CardContent>
              <Separator />
              <CardContent className="pt-4">
                <AddSectionButton
                  userId={userId}
                  organizationId={organizationId}
                  pageId={selectedPageId}
                  onSectionAdded={() => {
                    queryClient.invalidateQueries({ queryKey: ["sections", selectedPageId] });
                  }}
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent>
              <div className="text-center text-gray-500">
                <Layout className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Select a page from the sidebar to start editing</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
