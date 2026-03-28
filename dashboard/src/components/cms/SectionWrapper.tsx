import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SectionWrapperProps {
  title: string;
  description?: string;
  itemCount?: number;
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  children: ReactNode;
  isSaving?: boolean;
}

export function SectionWrapper({
  title,
  description,
  itemCount,
  hasChanges,
  onSave,
  onReset,
  children,
  isSaving = false,
}: SectionWrapperProps) {
  const { t } = useLanguage();
  
  return (
    <Card>
      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 m-6 mb-0">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            {t('content.unsavedChanges')}
          </p>
        </div>
      )}
      <CardContent className="space-y-6 pt-6">{children}</CardContent>
    </Card>
  );
}
