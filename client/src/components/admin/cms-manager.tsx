import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, RotateCcw, Eye, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HomePageContent {
  id: string;
  section: string;
  key: string;
  value: string;
  type: string;
  displayName: string;
  description?: string;
  sortOrder: number;
}

interface ContentSection {
  [key: string]: HomePageContent;
}

interface ContentData {
  [section: string]: ContentSection;
}

export function CmsManager() {
  const [contentData, setContentData] = useState<ContentData>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery<HomePageContent[]>({
    queryKey: ["/api/home-content"],
  });

  const updateMutation = useMutation({
    mutationFn: async (contentList: any[]) => {
      const response = await fetch("/api/home-content/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentList),
      });
      if (!response.ok) throw new Error("Error al actualizar contenido");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home-content"] });
      toast({
        title: "Contenido actualizado",
        description: "Los cambios se han guardado correctamente",
      });
      setHasChanges(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el contenido",
        variant: "destructive",
      });
    },
  });

  // Group content by sections
  useEffect(() => {
    if (content) {
      const grouped = content.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = {};
        acc[item.section][item.key] = item;
        return acc;
      }, {} as ContentData);
      setContentData(grouped);
    }
  }, [content]);

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
    const updates = Object.values(contentData)
      .flatMap(section => Object.values(section))
      .map(item => ({
        section: item.section,
        key: item.key,
        value: item.value,
        type: item.type,
        displayName: item.displayName,
        description: item.description,
        sortOrder: item.sortOrder
      }));
    
    updateMutation.mutate(updates);
  };

  const handleReset = () => {
    if (content) {
      const grouped = content.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = {};
        acc[item.section][item.key] = item;
        return acc;
      }, {} as ContentData);
      setContentData(grouped);
      setHasChanges(false);
    }
  };

  const renderInput = (item: HomePageContent, section: string) => {
    const value = contentData[section]?.[item.key]?.value || "";
    
    switch (item.type) {
      case "color":
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

  const sections = Object.keys(contentData).sort();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 dark:text-white">
            Editor de Contenido
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Edita todos los textos, colores y contenido de la página principal
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Eye className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Vista Previa</span>
            <span className="sm:hidden">Previa</span>
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            disabled={!hasChanges}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Descartar</span>
            <span className="sm:hidden">Reset</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            size="sm"
            className="w-full sm:w-auto"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">Guardar Cambios</span>
            <span className="sm:hidden">Guardar</span>
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            Tienes cambios sin guardar. Haz clic en "Guardar Cambios" para aplicarlos.
          </p>
        </div>
      )}

      <Tabs defaultValue={sections[0]} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-gray-100 dark:bg-gray-700">
          {sections.map((section) => (
            <TabsTrigger 
              key={section} 
              value={section} 
              className="capitalize text-xs sm:text-sm px-2 py-3 sm:px-4 sm:py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-pink-primary dark:data-[state=active]:text-pink-400 rounded-md transition-all duration-200"
            >
              {section === 'hero' ? 'Inicio' : 
               section === 'about' ? 'Acerca' :
               section === 'contact' ? 'Contacto' :
               section === 'categories' ? 'Categorías' : section}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section} value={section} className="mt-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Sección: {section === 'hero' ? 'Inicio' : 
                            section === 'about' ? 'Acerca de Nosotros' :
                            section === 'contact' ? 'Contacto' :
                            section === 'categories' ? 'Categorías' : section}
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
                            item.type === 'color' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            item.type === 'text' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }
                        >
                          {item.type}
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
              src="/"
              className="w-full h-[70vh] border-0"
              title="Vista Previa"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}