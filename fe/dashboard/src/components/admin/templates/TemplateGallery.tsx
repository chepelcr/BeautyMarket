import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Search, Filter } from "lucide-react";
import { TemplateCard } from "./TemplateCard";
import { PlaygroundCard } from "./PlaygroundCard";
import { TemplatePreview } from "./TemplatePreview";
import { Template, TemplateGalleryProps } from "./types";
import config from "@/lib/config";

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const API_BASE_URL = config.apiBaseUrl || "";

  // Fetch templates from API
  const { data: templates, isLoading, isError, error } = useQuery<Template[]>({
    queryKey: [`${API_BASE_URL}/api/templates?activeOnly=true`],
  });

  // Get unique categories
  const categories = useMemo(() => {
    if (!templates) return [];
    const uniqueCategories = Array.from(new Set(templates.map((t) => t.category)));
    return uniqueCategories.sort();
  }, [templates]);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];

    let filtered = [...templates];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.displayName.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // Sort by sortOrder
    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    return filtered;
  }, [templates, selectedCategory, searchQuery]);

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
  };

  const handleSelectPlayground = () => {
    onSelectTemplate(null); // null indicates playground/start from scratch
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Choose Your Template</h2>
          <p className="text-muted-foreground mt-2">
            Select a pre-designed template to get started quickly, or start from scratch with our playground.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active filters indicator */}
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-auto py-1 px-2"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading templates...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col justify-center items-center py-20 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Failed to Load Templates</h3>
          <p className="text-muted-foreground max-w-md">
            {error instanceof Error
              ? error.message
              : "An error occurred while loading templates. Please try again later."}
          </p>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && !isError && (
        <>
          {filteredTemplates.length === 0 && !searchQuery && !selectedCategory ? (
            // No templates available at all
            <div className="flex flex-col justify-center items-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Templates Available</h3>
              <p className="text-muted-foreground max-w-md">
                There are currently no templates to display. You can start from scratch with our playground.
              </p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            // No templates match the filters
            <div className="flex flex-col justify-center items-center py-20 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                No templates match your search criteria. Try adjusting your filters.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Playground Card - Always first if no filters */}
              {!searchQuery && !selectedCategory && (
                <PlaygroundCard onSelect={handleSelectPlayground} />
              )}

              {/* Template Cards */}
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelectTemplate}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      <TemplatePreview
        template={previewTemplate}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
