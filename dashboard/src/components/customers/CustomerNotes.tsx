import { useState, useEffect } from 'react';
import { FileText, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';

interface CustomerNotesProps {
  notes?: string;
  onSave: (notes: string) => Promise<void>;
  isSaving?: boolean;
}

export function CustomerNotes({ notes = '', onSave, isSaving }: CustomerNotesProps) {
  const { t } = useLanguage();
  const [localNotes, setLocalNotes] = useState(notes);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalNotes(notes);
    setHasChanges(false);
  }, [notes]);

  const handleChange = (value: string) => {
    setLocalNotes(value);
    setHasChanges(value !== notes);
  };

  const handleSave = async () => {
    await onSave(localNotes);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('customers.notes.title')}
          </CardTitle>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="sm"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t('common.save')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={localNotes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={t('customers.notes.placeholder')}
          className="min-h-[120px] resize-none"
        />
        {hasChanges && (
          <p className="text-xs text-muted-foreground mt-2">
            {t('customers.notes.unsavedChanges')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
