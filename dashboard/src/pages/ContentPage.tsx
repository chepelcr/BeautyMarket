import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, History, X, Save } from "lucide-react";
import { Link } from "wouter";
import { toast } from "@/hooks/use-toast";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { BaseSectionEditor } from "@/components/cms/BaseSectionEditor";
import { Page, PageSection, SectionContent, ContentSection } from "@/components/cms/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContentData {
  [section: string]: ContentSection;
}

interface ContentPageProps {
  defaultActiveSection?: string;
}

export default function ContentPage({ defaultActiveSection = "hero" }: ContentPageProps) {
  const [contentData, setContentData] = useState<ContentData>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState(defaultActiveSection);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: pagesWithContent, isLoading } = useQuery<any[]>({
    queryKey: ["pages-content", defaultOrg?.id],
    queryFn: async () => {
      if (!user?.id || !defaultOrg?.id) throw new Error("User or organization not found");
      const response = await apiRequest(
        "GET",
        buildOrgApiUrl(user.id, defaultOrg.id, "/pages?includeContent=true")
      );
      return response.json();
    },
    enabled: !!user?.id && !!defaultOrg?.id,
  });

  const updateContentMutation = useMutation({
    mutationFn: async (updates: { sectionId: string; content: any[] }[]) => {
      if (!user?.id || !defaultOrg?.id) throw new Error("Missing required data");

      await apiRequest(
        "POST",
        buildOrgApiUrl(user.id, defaultOrg.id, "/content/bulk-all"),
        { updates }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages-content"] });
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      toast({
        title: t("content.updated"),
        description: t("content.updatedDescription"),
      });
      setHasChanges(false);
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: t("common.error"),
        description: t("content.updateError"),
        variant: "destructive",
      });
    },
  });

  const availablePages = pagesWithContent || [];

  useEffect(() => {
    if (pagesWithContent) {
      const grouped: ContentData = {};

      pagesWithContent.forEach((page: any) => {
        page.sections?.forEach((section: any) => {
          const key = `${page.slug}-${section.sectionType}`;
          grouped[key] = section.content.reduce((acc: any, item: any) => {
            acc[item.key] = item;
            return acc;
          }, {} as ContentSection);
        });
      });

      setContentData(grouped);

      if (pagesWithContent.length > 0) {
        setActiveSection(pagesWithContent[0].slug);
        const firstSection = pagesWithContent[0].sections?.[0];
        if (firstSection) {
          setTimeout(() => setOpenAccordion(firstSection.id), 650);
        }
      }
    }
  }, [pagesWithContent]);

  useEffect(() => {
    const page = availablePages.find((p: any) => p.slug === activeSection);
    const firstSection = page?.sections?.[0];
    if (firstSection) {
      setTimeout(() => setOpenAccordion(firstSection.id), 650);
    }
  }, [activeSection, availablePages]);

  const handleInputChange = (sectionKey: string, key: string, value: string) => {
    setContentData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [key]: {
          ...prev[sectionKey][key],
          value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    if (!pagesWithContent) return;
    
    const allUpdates = Object.entries(contentData).map(([sectionKey, content]) => {
      const [pageSlug, sectionType] = sectionKey.split('-');
      const page = pagesWithContent.find((p: any) => p.slug === pageSlug);
      const section = page?.sections?.find((s: any) => s.sectionType === sectionType);
      
      if (!section) return null;

      const updates = Object.values(content).map((item) => ({
        key: item.key,
        value: item.value,
        valueType: item.valueType,
        displayName: item.displayName,
        description: item.description,
        sortOrder: item.sortOrder,
      }));

      return {
        sectionId: section.id,
        content: updates,
      };
    }).filter(Boolean) as { sectionId: string; content: any[] }[];

    if (allUpdates.length > 0) {
      updateContentMutation.mutate(allUpdates);
    }
  };

  const handleDiscardAll = () => {
    if (pagesWithContent) {
      const grouped: ContentData = {};
      pagesWithContent.forEach((page: any) => {
        page.sections?.forEach((section: any) => {
          const key = `${page.slug}-${section.sectionType}`;
          grouped[key] = section.content.reduce((acc: any, item: any) => {
            acc[item.key] = item;
            return acc;
          }, {} as ContentSection);
        });
      });
      setContentData(grouped);
      setHasChanges(false);
    }
  };

  const handleSectionSave = (sectionKey: string, updatedContent: ContentSection) => {
    if (!pagesWithContent) return;

    const [pageSlug, sectionType] = sectionKey.split('-');
    const page = pagesWithContent.find((p: any) => p.slug === pageSlug);
    const section = page?.sections?.find((s: any) => s.sectionType === sectionType);
    
    if (!section) return;

    const updates = Object.values(updatedContent).map((item) => ({
      key: item.key,
      value: item.value,
      valueType: item.valueType,
      displayName: item.displayName,
      description: item.description,
      sortOrder: item.sortOrder,
    }));

    updateContentMutation.mutate([{
      sectionId: section.id,
      content: updates,
    }]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const validActiveSection = availablePages.find((p: any) => p.slug === activeSection)?.slug || availablePages[0]?.slug || "";

  const getPageTitle = (page: Page) => {
    const key = `content.page.${page.slug}`;
    return t(key) !== key ? t(key) : page.title;
  };

  const getSectionName = (section: PageSection) => {
    const key = `content.section.${section.sectionType}`;
    return t(key) !== key ? t(key) : section.name;
  };

  const getSectionDescription = (sectionKey: string) => {
    const [pageSlug, sectionType] = sectionKey.split('-');
    const key = `content.sectionDescription.${sectionType}`;
    return t(key) !== key ? t(key) : `Edit ${sectionType} content`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t("content.title")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {t("content.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            size="sm"
            disabled
          >
            <Eye className="w-4 h-4 mr-2" />
            {t("content.preview")}
          </Button>
          <Link href="/admin/deployments">
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              {t("content.history")}
            </Button>
          </Link>
          {hasChanges && (
            <>
              <Button
                onClick={handleDiscardAll}
                variant="outline"
                size="sm"
                disabled={updateContentMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={updateContentMutation.isPending}
                size="sm"
              >
                {updateContentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {!updateContentMutation.isPending && <Save className="w-4 h-4 mr-2" />}
                {updateContentMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={validActiveSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full h-auto p-1 bg-muted" style={{ gridTemplateColumns: `repeat(${availablePages.length}, minmax(0, 1fr))` }}>
          {availablePages.map((page) => (
            <TabsTrigger
              key={page.slug}
              value={page.slug}
              disabled={updateContentMutation.isPending}
              className="capitalize text-xs sm:text-sm px-2 py-3 sm:px-4 sm:py-2 data-[state=active]:bg-background data-[state=active]:text-primary rounded-md transition-all duration-200"
            >
              {getPageTitle(page)}
            </TabsTrigger>
          ))}
        </TabsList>

        {availablePages.map((page: any) => {
          const pageSections = page.sections || [];
          return (
            <TabsContent key={page.slug} value={page.slug} className="mt-6 page-enter">
              <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                {pageSections.map((section: any) => {
                  const sectionKey = `${page.slug}-${section.sectionType}`;
                  return (
                    <AccordionItem key={section.id} value={section.id}>
                      <AccordionTrigger className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                          <span>{getSectionName(section)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {Object.keys(contentData[sectionKey] || {}).length} {t('common.items')}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <BaseSectionEditor
                          sectionType={sectionKey}
                          title={getSectionName(section)}
                          description={getSectionDescription(sectionKey)}
                          content={contentData[sectionKey] || {}}
                          onSave={(updatedContent) => handleSectionSave(sectionKey, updatedContent)}
                          onInputChange={(key, value) => handleInputChange(sectionKey, key, value)}
                          isSaving={updateContentMutation.isPending}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl">
              {t("content.previewTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <iframe
              key={`preview-${Date.now()}`}
              src="/"
              className="w-full h-[70vh] border-0"
              title={t("content.preview")}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
