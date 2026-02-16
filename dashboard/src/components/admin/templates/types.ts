export interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface TemplateCardProps {
  template: Template;
  onSelect: (templateId: string) => void;
  onPreview: (template: Template) => void;
  isSelected?: boolean;
}

export interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string | null) => void;
}

export interface TemplatePreviewProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateId: string) => void;
}
