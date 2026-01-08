import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/image-upload";
import { DeployButton } from "@/components/deploy-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, RotateCcw, Eye, X, History } from "lucide-react";
import { Link } from "wouter";
import { toast } from "@/hooks/use-toast";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";

// New API structure types
interface Page {
  id: string;
  organizationId: string;
  type: string;
  slug: string;
  title: string;
  metaDescription?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface PageSection {
  id: string;
  pageId: string;
  sectionType: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SectionContent {
  id: string;
  sectionId: string;
  key: string;
  value: string;
  valueType: string;
  displayName: string;
  description?: string;
  sortOrder: number;
}

interface ContentSection {
  [key: string]: SectionContent;
}

interface ContentData {
  [section: string]: ContentSection;
}

interface CmsManagerProps {
  defaultActiveSection?: string;
}

export function CmsManager({ defaultActiveSection = "hero" }: CmsManagerProps) {
  const [contentData, setContentData] = useState<ContentData>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState(defaultActiveSection);
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Fetch home page
  const { data: homePage, isLoading: isLoadingPage } = useQuery<Page>({
    queryKey: ['page', 'home', defaultOrg?.id],
    queryFn: async () => {
      if (!user?.id || !defaultOrg?.id) throw new Error('User or organization not found');
      const response = await apiRequest('GET', buildOrgApiUrl(user.id, defaultOrg.id, '/pages?type=home'));
      const pages = await response.json();
      return pages[0]; // Get first home page
    },
    enabled: !!user?.id && !!defaultOrg?.id,
  });

  // Fetch sections for the home page
  const { data: sections, isLoading: isLoadingSections } = useQuery<PageSection[]>({
    queryKey: ['sections', homePage?.id],
    queryFn: async () => {
      if (!user?.id || !defaultOrg?.id || !homePage?.id) throw new Error('Missing required data');
      const response = await apiRequest(
        'GET',
        buildOrgApiUrl(user.id, defaultOrg.id, `/pages/${homePage.id}/sections`)
      );
      return response.json();
    },
    enabled: !!user?.id && !!defaultOrg?.id && !!homePage?.id,
  });

  // Fetch content for all sections
  const { data: allContent, isLoading: isLoadingContent } = useQuery<Record<string, SectionContent[]>>({
    queryKey: ['content', sections?.map(s => s.id)],
    queryFn: async () => {
      if (!user?.id || !defaultOrg?.id || !homePage?.id || !sections) {
        throw new Error('Missing required data');
      }

      const contentBySection: Record<string, SectionContent[]> = {};

      for (const section of sections) {
        const response = await apiRequest(
          'GET',
          buildOrgApiUrl(user.id, defaultOrg.id, `/pages/${homePage.id}/sections/${section.id}/content`)
        );
        contentBySection[section.sectionType] = await response.json();
      }

      return contentBySection;
    },
    enabled: !!user?.id && !!defaultOrg?.id && !!homePage?.id && !!sections && sections.length > 0,
  });

  const isLoading = isLoadingPage || isLoadingSections || isLoadingContent;

  // Mutation for bulk updating content
  const updateContentMutation = useMutation({
    mutationFn: async (updates: { sectionId: string; sectionType: string; content: any[] }) => {
      if (!user?.id || !defaultOrg?.id || !homePage?.id) throw new Error('Missing required data');

      const response = await apiRequest(
        "POST",
        buildOrgApiUrl(user.id, defaultOrg.id, `/pages/${homePage.id}/sections/${updates.sectionId}/content/bulk`),
        { content: updates.content }
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch content
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: t('content.updated'),
        description: t('content.updatedDesc'),
      });
      setHasChanges(false);
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: t('common.error'),
        description: t('products.errorDesc'),
        variant: "destructive",
      });
    },
  });

  // Transform content data into editable structure
  useEffect(() => {
    if (allContent && sections) {
      const grouped: ContentData = {};

      sections.forEach(section => {
        const sectionContents = allContent[section.sectionType] || [];
        grouped[section.sectionType] = sectionContents.reduce((acc, item) => {
          acc[item.key] = item;
          return acc;
        }, {} as ContentSection);
      });

      setContentData(grouped);

      // Set active section based on prop if available in content
      if (defaultActiveSection && grouped[defaultActiveSection]) {
        setActiveSection(defaultActiveSection);
      } else if (Object.keys(grouped).length > 0) {
        // Fallback to first available section
        setActiveSection(Object.keys(grouped)[0]);
      }
    }
  }, [allContent, sections, defaultActiveSection]);

  const handleInputChange = (section: string, key: string, value: string) => {
    setContentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: {
          ...prev[section][key],
          value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!sections) return;

    // Group updates by section
    const updatesBySectionType: Record<string, any[]> = {};

    Object.entries(contentData).forEach(([sectionType, sectionItems]) => {
      updatesBySectionType[sectionType] = Object.values(sectionItems).map(item => ({
        key: item.key,
        value: item.value,
        valueType: item.valueType,
        displayName: item.displayName,
        description: item.description,
        sortOrder: item.sortOrder
      }));
    });

    // Update each section's content
    sections.forEach(section => {
      const updates = updatesBySectionType[section.sectionType];
      if (updates && updates.length > 0) {
        updateContentMutation.mutate({
          sectionId: section.id,
          sectionType: section.sectionType,
          content: updates
        });
      }
    });
  };

  const handleReset = () => {
    if (allContent && sections) {
      const grouped: ContentData = {};

      sections.forEach(section => {
        const sectionContents = allContent[section.sectionType] || [];
        grouped[section.sectionType] = sectionContents.reduce((acc, item) => {
          acc[item.key] = item;
          return acc;
        }, {} as ContentSection);
      });

      setContentData(grouped);
      setHasChanges(false);
    }
  };

  // Get the mode from the background style of the section (single source of truth)
  const getSectionMode = (section: string): string => {
    const backgroundStyle = contentData[section]?.backgroundStyle?.value || "";
    try {
      const bgData = JSON.parse(backgroundStyle);
      return bgData.mode || 'both';
    } catch {
      return 'both'; // Default to 'both' for consistency
    }
  };

  // Update all color fields in a section when mode changes
  const updateSectionMode = (section: string, newMode: string) => {
    const sectionData = contentData[section];
    if (!sectionData) return;

    const updates: { [key: string]: string } = {};

    // Update background style mode
    if (sectionData.backgroundStyle) {
      try {
        const bgData = JSON.parse(sectionData.backgroundStyle.value || '{}');
        bgData.mode = newMode;
        updates.backgroundStyle = JSON.stringify(bgData);
      } catch {
        updates.backgroundStyle = JSON.stringify({ type: 'color', mode: newMode, value: '#ffffff' });
      }
    }

    // Update all color fields mode
    Object.entries(sectionData).forEach(([key, item]) => {
      if (item.valueType === 'color') {
        try {
          const colorData = JSON.parse(item.value || '{}');
          colorData.mode = newMode;
          if (newMode === 'single') {
            colorData.value = colorData.lightValue || colorData.value || '#000000';
          } else if (newMode === 'both') {
            colorData.lightValue = colorData.lightValue || colorData.value || '#000000';
            colorData.darkValue = colorData.darkValue || '#ffffff';
          }
          updates[key] = JSON.stringify(colorData);
        } catch {
          // Convert simple color to new format
          const currentColor = item.value || '#000000';
          if (newMode === 'single') {
            updates[key] = JSON.stringify({ mode: 'single', value: currentColor });
          } else {
            updates[key] = JSON.stringify({ 
              mode: 'both', 
              lightValue: currentColor, 
              darkValue: currentColor === '#000000' ? '#ffffff' : '#000000' 
            });
          }
        }
      }
    });

    // Apply all updates
    Object.entries(updates).forEach(([key, value]) => {
      handleInputChange(section, key, value);
    });
  };

  const renderInput = (item: SectionContent, section: string) => {
    const value = contentData[section]?.[item.key]?.value || "";

    switch (item.valueType) {
      case "color":
        const sectionMode = getSectionMode(section);
        return (
          <div className="space-y-3">
            {(() => {
              try {
                const colorData = JSON.parse(value || '{"mode":"single","value":"#000000"}');
                if (sectionMode === 'both') {
                  // Show two color pickers for light and dark modes
                  return (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Color Modo Claro</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={colorData.lightValue || colorData.value || '#000000'}
                            onChange={(e) => {
                              colorData.mode = 'both';
                              colorData.lightValue = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(colorData));
                            }}
                            className="w-16 h-10 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={colorData.lightValue || colorData.value || '#000000'}
                            onChange={(e) => {
                              colorData.mode = 'both';
                              colorData.lightValue = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(colorData));
                            }}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Color Modo Oscuro</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={colorData.darkValue || '#ffffff'}
                            onChange={(e) => {
                              colorData.mode = 'both';
                              colorData.darkValue = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(colorData));
                            }}
                            className="w-16 h-10 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={colorData.darkValue || '#ffffff'}
                            onChange={(e) => {
                              colorData.mode = 'both';
                              colorData.darkValue = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(colorData));
                            }}
                            placeholder="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Single color picker
                  return (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={colorData.value || value || '#000000'}
                        onChange={(e) => {
                          colorData.mode = 'single';
                          colorData.value = e.target.value;
                          handleInputChange(section, item.key, JSON.stringify(colorData));
                        }}
                        className="w-16 h-10 p-1 border rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={colorData.value || value || '#000000'}
                        onChange={(e) => {
                          colorData.mode = 'single';
                          colorData.value = e.target.value;
                          handleInputChange(section, item.key, JSON.stringify(colorData));
                        }}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  );
                }
              } catch {
                // Fallback for non-JSON values (legacy support)
                return (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => handleInputChange(section, item.key, e.target.value)}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => handleInputChange(section, item.key, e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                );
              }
            })()}
          </div>
        );
      case "background":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo de Fondo</Label>
                <select 
                  className="w-full p-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  value={JSON.parse(value || '{"type":"color"}').type}
                  onChange={(e) => {
                    const bgData = JSON.parse(value || '{"type":"color"}');
                    bgData.type = e.target.value;
                    if (e.target.value === 'color') {
                      bgData.value = bgData.color || '#ffffff';
                    } else if (e.target.value === 'gradient') {
                      bgData.gradient = bgData.gradient || { from: '#ffffff', to: '#000000', direction: 'to-r' };
                    } else if (e.target.value === 'image') {
                      bgData.image = bgData.image || { url: '', opacity: 1 };
                    }
                    handleInputChange(section, item.key, JSON.stringify(bgData));
                  }}
                >
                  <option value="color">Color Sólido</option>
                  <option value="gradient">Gradiente</option>
                  <option value="image">Imagen</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Modo de Colores</Label>
                <select 
                  className="w-full p-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  value={getSectionMode(section)}
                  onChange={(e) => {
                    updateSectionMode(section, e.target.value);
                  }}
                >
                  <option value="both">Ambos Modos (Claro y Oscuro)</option>
                  <option value="single">Color Único</option>
                </select>
              </div>
            </div>
            {(() => {
              const bgData = JSON.parse(value || '{"type":"color","value":"#ffffff","mode":"both"}');
              if (bgData.type === 'color') {
                const mode = bgData.mode || 'both';
                if (mode === 'both') {
                  // Show two color pickers for light and dark modes
                  return (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Color Modo Claro</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={bgData.lightValue || bgData.value || '#ffffff'}
                            onChange={(e) => {
                              bgData.lightValue = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(bgData));
                            }}
                            className="w-16 h-10 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={bgData.lightValue || bgData.value || '#ffffff'}
                            onChange={(e) => {
                              bgData.lightValue = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(bgData));
                            }}
                            placeholder="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Color Modo Oscuro</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={bgData.darkValue || '#000000'}
                            onChange={(e) => {
                              bgData.darkValue = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(bgData));
                            }}
                            className="w-16 h-10 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={bgData.darkValue || '#000000'}
                            onChange={(e) => {
                              bgData.darkValue = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(bgData));
                            }}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Single color picker for light-only or dark-only
                  return (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={bgData.value || '#ffffff'}
                        onChange={(e) => {
                          bgData.value = e.target.value;
                          handleInputChange(section, item.key, JSON.stringify(bgData));
                        }}
                        className="w-16 h-10 p-1 border rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={bgData.value || '#ffffff'}
                        onChange={(e) => {
                          bgData.value = e.target.value;
                          handleInputChange(section, item.key, JSON.stringify(bgData));
                        }}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  );
                }
              } else if (bgData.type === 'gradient') {
                const mode = bgData.mode || 'both';
                if (mode === 'both') {
                  return (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gradiente Modo Claro</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex gap-2 items-center">
                            <Input
                              type="color"
                              value={bgData.lightGradient?.from || bgData.gradient?.from || '#ffffff'}
                              onChange={(e) => {
                                bgData.lightGradient = bgData.lightGradient || {};
                                bgData.lightGradient.from = e.target.value;
                                handleInputChange(section, item.key, JSON.stringify(bgData));
                              }}
                              className="w-10 h-8 p-1 border rounded cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={bgData.lightGradient?.from || bgData.gradient?.from || '#ffffff'}
                              onChange={(e) => {
                                bgData.lightGradient = bgData.lightGradient || {};
                                bgData.lightGradient.from = e.target.value;
                                handleInputChange(section, item.key, JSON.stringify(bgData));
                              }}
                              placeholder="Desde"
                              className="flex-1 text-xs"
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="color"
                              value={bgData.lightGradient?.to || bgData.gradient?.to || '#f3f4f6'}
                              onChange={(e) => {
                                bgData.lightGradient = bgData.lightGradient || {};
                                bgData.lightGradient.to = e.target.value;
                                handleInputChange(section, item.key, JSON.stringify(bgData));
                              }}
                              className="w-10 h-8 p-1 border rounded cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={bgData.lightGradient?.to || bgData.gradient?.to || '#f3f4f6'}
                              onChange={(e) => {
                                bgData.lightGradient = bgData.lightGradient || {};
                                bgData.lightGradient.to = e.target.value;
                                handleInputChange(section, item.key, JSON.stringify(bgData));
                              }}
                              placeholder="Hasta"
                              className="flex-1 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gradiente Modo Oscuro</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex gap-2 items-center">
                            <Input
                              type="color"
                              value={bgData.darkGradient?.from || '#1f2937'}
                              onChange={(e) => {
                                bgData.darkGradient = bgData.darkGradient || {};
                                bgData.darkGradient.from = e.target.value;
                                handleInputChange(section, item.key, JSON.stringify(bgData));
                              }}
                              className="w-10 h-8 p-1 border rounded cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={bgData.darkGradient?.from || '#1f2937'}
                              onChange={(e) => {
                                bgData.darkGradient = bgData.darkGradient || {};
                                bgData.darkGradient.from = e.target.value;
                                handleInputChange(section, item.key, JSON.stringify(bgData));
                              }}
                              placeholder="Desde"
                              className="flex-1 text-xs"
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="color"
                              value={bgData.darkGradient?.to || '#000000'}
                              onChange={(e) => {
                                bgData.darkGradient = bgData.darkGradient || {};
                                bgData.darkGradient.to = e.target.value;
                                handleInputChange(section, item.key, JSON.stringify(bgData));
                              }}
                              className="w-10 h-8 p-1 border rounded cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={bgData.darkGradient?.to || '#000000'}
                              onChange={(e) => {
                                bgData.darkGradient = bgData.darkGradient || {};
                                bgData.darkGradient.to = e.target.value;
                                handleInputChange(section, item.key, JSON.stringify(bgData));
                              }}
                              placeholder="Hasta"
                              className="flex-1 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <select
                        className="w-full p-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        value={bgData.gradient?.direction || 'to-r'}
                        onChange={(e) => {
                          bgData.gradient = bgData.gradient || {};
                          bgData.gradient.direction = e.target.value;
                          // Also update for light/dark variants
                          if (bgData.lightGradient) bgData.lightGradient.direction = e.target.value;
                          if (bgData.darkGradient) bgData.darkGradient.direction = e.target.value;
                          handleInputChange(section, item.key, JSON.stringify(bgData));
                        }}
                      >
                        <option value="to-r">Izquierda → Derecha</option>
                        <option value="to-l">Derecha → Izquierda</option>
                        <option value="to-b">Arriba → Abajo</option>
                        <option value="to-t">Abajo → Arriba</option>
                        <option value="to-br">Esquina → Esquina ↘</option>
                        <option value="to-bl">Esquina → Esquina ↙</option>
                        <option value="to-tr">Esquina → Esquina ↗</option>
                        <option value="to-tl">Esquina → Esquina ↖</option>
                        <option value="radial">Radial (centro)</option>
                      </select>
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={bgData.gradient?.from || '#ffffff'}
                            onChange={(e) => {
                              bgData.gradient = bgData.gradient || {};
                              bgData.gradient.from = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(bgData));
                            }}
                            className="w-10 h-8 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={bgData.gradient?.from || '#ffffff'}
                            onChange={(e) => {
                              bgData.gradient = bgData.gradient || {};
                              bgData.gradient.from = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(bgData));
                            }}
                            placeholder="Desde"
                            className="flex-1 text-xs"
                          />
                        </div>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={bgData.gradient?.to || '#000000'}
                            onChange={(e) => {
                              bgData.gradient = bgData.gradient || {};
                              bgData.gradient.to = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(bgData));
                            }}
                            className="w-10 h-8 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={bgData.gradient?.to || '#000000'}
                            onChange={(e) => {
                              bgData.gradient = bgData.gradient || {};
                              bgData.gradient.to = e.target.value;
                              handleInputChange(section, item.key, JSON.stringify(bgData));
                            }}
                            placeholder="Hasta"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      <select
                        className="w-full p-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        value={bgData.gradient?.direction || 'to-r'}
                        onChange={(e) => {
                          bgData.gradient = bgData.gradient || {};
                          bgData.gradient.direction = e.target.value;
                          handleInputChange(section, item.key, JSON.stringify(bgData));
                        }}
                      >
                        <option value="to-r">Izquierda → Derecha</option>
                        <option value="to-l">Derecha → Izquierda</option>
                        <option value="to-b">Arriba → Abajo</option>
                        <option value="to-t">Abajo → Arriba</option>
                        <option value="to-br">Esquina → Esquina ↘</option>
                        <option value="to-bl">Esquina → Esquina ↙</option>
                        <option value="to-tr">Esquina → Esquina ↗</option>
                        <option value="to-tl">Esquina → Esquina ↖</option>
                        <option value="radial">Radial (centro)</option>
                      </select>
                    </div>
                  );
                }
              } else if (bgData.type === 'image') {
                return (
                  <div className="space-y-3">
                    <ImageUpload
                      value={bgData.image?.url || ''}
                      onChange={(url) => {
                        bgData.image = bgData.image || {};
                        bgData.image.url = url;
                        handleInputChange(section, item.key, JSON.stringify(bgData));
                      }}
                      label="Imagen de fondo"
                      folder={`images/${section}-backgrounds`}
                    />
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Transparencia: {Math.round((bgData.image?.opacity || 1) * 100)}%</Label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={bgData.image?.opacity || 1}
                        onChange={(e) => {
                          bgData.image = bgData.image || {};
                          bgData.image.opacity = parseFloat(e.target.value);
                          handleInputChange(section, item.key, JSON.stringify(bgData));
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        );
      case "text":
        if (item.key.includes('description') || item.value.length > 100) {
          return (
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(section, item.key, e.target.value)}
              rows={3}
              className="resize-none"
            />
          );
        }
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(section, item.key, e.target.value)}
          />
        );
      case "image":
        return (
          <ImageUpload
            value={value}
            onChange={(url) => handleInputChange(section, item.key, url)}
            label=""
            folder={`images/${section}-images`}
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(section, item.key, e.target.value)}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Define proper section order matching the home page
  const sectionOrder = ['hero', 'categories', 'about', 'contact', 'site'];
  const availableSections = sectionOrder.filter(section => contentData[section]);

  // Ensure active section is valid, default to first available or hero
  const validActiveSection = availableSections.includes(activeSection)
    ? activeSection
    : (availableSections.includes('hero') ? 'hero' : availableSections[0]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 dark:text-white">
            {t('content.editor')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {t('content.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:flex sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            size="sm"
            className="w-full sm:flex-1 lg:w-auto"
          >
            <Eye className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden md:inline">{t('content.preview')}</span>
            <span className="md:hidden">{t('content.preview')}</span>
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            disabled={!hasChanges}
            className="w-full sm:flex-1 lg:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden md:inline">{t('common.cancel')}</span>
            <span className="md:hidden">{t('common.cancel')}</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            size="sm"
            className="w-full sm:flex-1 lg:w-auto"
          >
            <Save className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden md:inline">{t('common.save')}</span>
            <span className="md:hidden">{t('common.save')}</span>
          </Button>

          <Link href="/admin/deployments" className="w-full sm:flex-1 lg:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full py-2"
            >
              <History className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden md:inline">{t('content.history')}</span>
              <span className="md:hidden">{t('content.history')}</span>
            </Button>
          </Link>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            {t('content.saving')}
          </p>
        </div>
      )}

      <Tabs defaultValue={validActiveSection} key={validActiveSection} className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-auto p-1 bg-gray-100 dark:bg-gray-700">
          {availableSections.map((section) => (
            <TabsTrigger
              key={section}
              value={section}
              className="capitalize text-xs sm:text-sm px-2 py-3 sm:px-4 sm:py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-pink-primary dark:data-[state=active]:text-pink-400 rounded-md transition-all duration-200"
            >
              {section === 'hero' ? 'Inicio' :
               section === 'about' ? 'Acerca' :
               section === 'contact' ? 'Contacto' :
               section === 'categories' ? 'Categorías' :
               section === 'site' ? 'Sitio' : section}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableSections.map((section) => (
          <TabsContent key={section} value={section} className="mt-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Sección: {section === 'hero' ? 'Inicio' : 
                            section === 'about' ? 'Acerca de Nosotros' :
                            section === 'contact' ? 'Contacto' :
                            section === 'categories' ? 'Categorías' :
                            section === 'site' ? 'Configuración del Sitio' : section}
                  <Badge variant="secondary">
                    {Object.keys(contentData[section] || {}).length} elementos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.values(contentData[section] || {})
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item, index) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={item.id} className="font-medium">
                          {item.displayName}
                        </Label>
                        <Badge
                          variant="outline"
                          className={
                            item.valueType === 'color' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            item.valueType === 'background' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            item.valueType === 'text' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }
                        >
                          {item.valueType === 'background' ? 'fondo' : item.valueType}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      )}
                      {renderInput(item, section)}
                      {index < Object.keys(contentData[section] || {}).length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] p-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-serif text-xl">Vista Previa de la Página Principal</DialogTitle>
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
              title="Vista Previa"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}