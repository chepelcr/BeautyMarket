import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, History, X } from "lucide-react";
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
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: homePage, isLoading: isLoadingPage } = useQuery<Page>({
    queryKey: ["page", "home", defaultOrg?.id],
    queryFn: async () => {
      if (!user?.id || !defaultOrg?.id) throw new Error("User or organization not found");
      const response = await apiRequest(
        "GET",
        buildOrgApiUrl(user.id, defaultOrg.id, "/pages?type=home")
      );
      const pages = await response.json();
      return pages[0];
    },
    enabled: !!user?.id && !!defaultOrg?.id,
  });

  const { data: sections, isLoading: isLoadingSections } = useQuery<PageSection[]>({
    queryKey: ["sections", homePage?.id],
    queryFn: async () => {
      if (!user?.id || !defaultOrg?.id || !homePage?.id)
        throw new Error("Missing required data");
      const response = await apiRequest(
        "GET",
        buildOrgApiUrl(user.id, defaultOrg.id, `/pages/${homePage.id}/sections`)
      );
      return response.json();
    },
    enabled: !!user?.id && !!defaultOrg?.id && !!homePage?.id,
  });

  const { data: allContent, isLoading: isLoadingContent } = useQuery<
    Record<string, SectionContent[]>
  >({
    queryKey: ["content", sections?.map((s) => s.id)],
    queryFn: async () => {
      if (!user?.id || !defaultOrg?.id || !homePage?.id || !sections) {
        throw new Error("Missing required data");
      }

      const contentBySection: Record<string, SectionContent[]> = {};

      for (const section of sections) {
        const response = await apiRequest(
          "GET",
          buildOrgApiUrl(
            user.id,
            defaultOrg.id,
            `/pages/${homePage.id}/sections/${section.id}/content`
          )
        );
        contentBySection[section.sectionType] = await response.json();
      }

      return contentBySection;
    },
    enabled:
      !!user?.id && !!defaultOrg?.id && !!homePage?.id && !!sections && sections.length > 0,
  });

  const isLoading = isLoadingPage || isLoadingSections || isLoadingContent;

  const updateContentMutation = useMutation({
    mutationFn: async (updates: {
      sectionId: string;
      sectionType: string;
      content: any[];
    }) => {
      if (!user?.id || !defaultOrg?.id || !homePage?.id)
        throw new Error("Missing required data");

      const response = await apiRequest(
        "POST",
        buildOrgApiUrl(
          user.id,
          defaultOrg.id,
          `/pages/${homePage.id}/sections/${updates.sectionId}/content/bulk`
        ),
        { content: updates.content }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
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

  useEffect(() => {
    if (allContent && sections) {
      const grouped: ContentData = {};

      sections.forEach((section) => {
        const sectionContents = allContent[section.sectionType] || [];
        grouped[section.sectionType] = sectionContents.reduce((acc, item) => {
          acc[item.key] = item;
          return acc;
        }, {} as ContentSection);
      });

      setContentData(grouped);

      if (defaultActiveSection && grouped[defaultActiveSection]) {
        setActiveSection(defaultActiveSection);
      } else if (Object.keys(grouped).length > 0) {
        setActiveSection(Object.keys(grouped)[0]);
      }
    }
  }, [allContent, sections, defaultActiveSection]);

  const handleInputChange = (section: string, key: string, value: string) => {
    setContentData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: {
          ...prev[section][key],
          value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleSectionSave = (section: string, updatedContent: ContentSection) => {
    if (!sections) return;

    const sectionInfo = sections.find((s) => s.sectionType === section);
    if (!sectionInfo) return;

    const updates = Object.values(updatedContent).map((item) => ({
      key: item.key,
      value: item.value,
      valueType: item.valueType,
      displayName: item.displayName,
      description: item.description,
      sortOrder: item.sortOrder,
    }));

    updateContentMutation.mutate({
      sectionId: sectionInfo.id,
      sectionType: section,
      content: updates,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  const sectionOrder = ["hero", "categories", "about", "contact", "site"];
  const availableSections = sectionOrder.filter((section) => contentData[section]);

  const validActiveSection = availableSections.includes(activeSection)
    ? activeSection
    : availableSections.includes("hero")
    ? "hero"
    : availableSections[0];

  const getSectionTitle = (section: string) => {
    switch (section) {
      case "hero":
        return t("content.section.hero");
      case "about":
        return t("content.section.about");
      case "contact":
        return t("content.section.contact");
      case "categories":
        return t("content.section.categories");
      case "site":
        return t("content.section.site");
      default:
        return section;
    }
  };

  const getSectionDescription = (section: string) => {
    switch (section) {
      case "hero":
        return t("content.sectionDescription.hero");
      case "about":
        return t("content.sectionDescription.about");
      case "contact":
        return t("content.sectionDescription.contact");
      case "categories":
        return t("content.sectionDescription.categories");
      case "site":
        return t("content.sectionDescription.site");
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 dark:text-white">
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
        </div>
      </div>

      <Tabs value={validActiveSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-auto p-1 bg-gray-100 dark:bg-gray-700">
          {availableSections.map((section) => (
            <TabsTrigger
              key={section}
              value={section}
              className="capitalize text-xs sm:text-sm px-2 py-3 sm:px-4 sm:py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-pink-primary dark:data-[state=active]:text-pink-400 rounded-md transition-all duration-200"
            >
              {getSectionTitle(section)}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableSections.map((section) => (
          <TabsContent key={section} value={section} className="mt-6">
            <BaseSectionEditor
              sectionType={section}
              title={`${t("content.sectionLabel")} ${getSectionTitle(section)}`}
              description={getSectionDescription(section)}
              content={contentData[section] || {}}
              onSave={(updatedContent) => handleSectionSave(section, updatedContent)}
              onInputChange={(key, value) => handleInputChange(section, key, value)}
              isSaving={updateContentMutation.isPending}
            />
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] p-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-serif text-xl">
                {t("content.previewTitle")}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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
