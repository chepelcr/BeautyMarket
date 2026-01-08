import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw } from "lucide-react";

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
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {itemCount !== undefined && (
                <Badge variant="secondary">{itemCount} elementos</Badge>
              )}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              disabled={!hasChanges || isSaving}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Descartar
            </Button>
            <Button
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
        {hasChanges && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Tienes cambios sin guardar en esta sección.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}
