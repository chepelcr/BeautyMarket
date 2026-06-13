import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, Store, Sparkles, Leaf, Crown, Heart, Star, Scissors } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TemplateCardProps } from "./types";

// Icon mapping based on category
const getCategoryIcon = (category: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    beauty: <Sparkles className="h-5 w-5" />,
    organic: <Leaf className="h-5 w-5" />,
    cosmetics: <Sparkles className="h-5 w-5" />,
    haircare: <Crown className="h-5 w-5" />,
    skincare: <Heart className="h-5 w-5" />,
    nails: <Star className="h-5 w-5" />,
    salon: <Scissors className="h-5 w-5" />,
    tech: <Store className="h-5 w-5" />,
    fashion: <Star className="h-5 w-5" />,
    starter: <Store className="h-5 w-5" />,
  };
  return iconMap[category.toLowerCase()] || <Store className="h-5 w-5" />;
};

// Color mapping based on category
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    beauty: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    organic: "bg-green-500/10 text-green-700 dark:text-green-400",
    cosmetics: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    haircare: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    skincare: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    nails: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400",
    salon: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    tech: "bg-primary/10 text-primary",
    fashion: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    starter: "bg-muted text-muted-foreground",
  };
  return colorMap[category.toLowerCase()] || "bg-muted text-muted-foreground";
};

export function TemplateCard({ template, onSelect, onPreview, isSelected }: TemplateCardProps) {
  const { t } = useLanguage();
  const categoryColor = getCategoryColor(template.category);
  const categoryIcon = getCategoryIcon(template.category);

  return (
    <Card className={`group relative transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-card flex flex-col h-full ${
      isSelected
        ? 'border-2 border-primary shadow-lg'
        : 'border hover:border-primary/50'
    }`}>
      <CardHeader className="flex-grow">
        {isSelected && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
              <Check className="h-4 w-4" />
            </div>
          </div>
        )}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${categoryColor} rounded-lg w-fit transition-transform duration-300 group-hover:scale-110`}>
            {categoryIcon}
          </div>
          <Badge variant="outline" className="capitalize">
            {template.category}
          </Badge>
        </div>

        {/* Thumbnail */}
        {template.thumbnailUrl ? (
          <div className="w-full h-48 mb-4 rounded-md overflow-hidden bg-muted">
            <img
              src={template.thumbnailUrl}
              alt={template.displayName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Preview";
              }}
            />
          </div>
        ) : (
          <div className="w-full h-48 mb-4 rounded-md bg-muted flex items-center justify-center">
            <Store className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        <CardTitle className="text-xl">{template.displayName}</CardTitle>
        <CardDescription className="line-clamp-3 text-justify">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <Button
          onClick={() => onPreview(template)}
          variant="outline"
          className="w-full"
        >
          <Eye className="mr-2 h-4 w-4" />
          {t('template.card.preview')}
        </Button>
        <Button
          onClick={() => onSelect(template.id)}
          className="w-full"
        >
          <Check className="mr-2 h-4 w-4" />
          {t('template.card.select')}
        </Button>
      </CardContent>
    </Card>
  );
}
