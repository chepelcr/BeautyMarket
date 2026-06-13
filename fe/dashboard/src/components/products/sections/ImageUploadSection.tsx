import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Eye } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImageUploadSectionProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  disabled?: boolean;
}

export function ImageUploadSection({
  value,
  onChange,
  folder = "images/products",
  disabled = false
}: ImageUploadSectionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(!disabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {t("products.form.image")}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={disabled}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <CardContent>
          <ImageUpload
            value={value}
            onChange={onChange}
            folder={folder}
            disabled={disabled}
          />
        </CardContent>
      </div>
    </Card>
  );
}
