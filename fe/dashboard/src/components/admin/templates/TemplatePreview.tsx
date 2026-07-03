import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Check, Store } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TemplatePreviewProps } from "./types";

export function TemplatePreview({
  template,
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplatePreviewProps) {
  const { t } = useLanguage();

  if (!template) return null;

  const handleUseTemplate = () => {
    onSelectTemplate(template.id);
    onOpenChange(false);
  };

  const handleViewDemo = () => {
    const demoUrl = `https://${template.name}-example.tsuru.jcampos.dev`;
    window.open(demoUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <DialogTitle className="text-2xl">{template.displayName}</DialogTitle>
              <DialogDescription className="text-base">
                {template.description}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="capitalize ml-4">
              {template.category}
            </Badge>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Preview Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('template.preview.title')}</h3>
          {template.thumbnailUrl ? (
            <div className="w-full rounded-lg overflow-hidden border bg-muted">
              <img
                src={template.thumbnailUrl}
                alt={`${t('template.preview.title')} ${template.displayName}`}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/1200x800/e2e8f0/64748b?text=${t('template.preview.noPreviewPlaceholder')}`;
                }}
              />
            </div>
          ) : (
            <div className="w-full h-96 rounded-lg border bg-muted flex flex-col items-center justify-center text-muted-foreground">
              <Store className="h-16 w-16 mb-4" />
              <p>{t('template.preview.noPreview')}</p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('template.preview.about')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {template.description}
            </p>
          </div>

          {/* Live Demo Link */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('template.preview.liveDemo')}</h3>
            <div className="flex items-center gap-2 p-4 rounded-lg border bg-muted/50">
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
              <code className="text-sm flex-1">
                {`https://${template.name}-example.tsuru.jcampos.dev`}
              </code>
              <Button
                onClick={handleViewDemo}
                variant="outline"
                size="sm"
              >
                {t('template.preview.visitDemo')}
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('template.preview.whatsIncluded')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>{t('template.preview.feature1', { category: template.category })}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>{t('template.preview.feature2')}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>{t('template.preview.feature3')}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>{t('template.preview.feature4')}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>{t('template.preview.feature5')}</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            {t('template.preview.cancel')}
          </Button>
          <Button
            onClick={handleUseTemplate}
            className="min-w-[160px]"
          >
            <Check className="mr-2 h-4 w-4" />
            {t('template.preview.useTemplate')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
