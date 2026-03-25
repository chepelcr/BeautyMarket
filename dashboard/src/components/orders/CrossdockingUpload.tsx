import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { FileDropZone } from '@/components/ui/file-drop-zone';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReportColorSelector, getDefaultColorForDepartment } from './ReportColorSelector';
import type { ReportColorScheme } from '@/models';

interface CrossdockingUploadProps {
  organizationId: string;
  documentNumber: string;
  reportColor?: ReportColorScheme;
  department?: string;
  onUploadSuccess?: () => void;
}

export function CrossdockingUpload({ organizationId, documentNumber, reportColor, department, onUploadSuccess }: CrossdockingUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<ReportColorScheme>(
    reportColor || getDefaultColorForDepartment(department || '')
  );
  const { toast } = useToast();
  const { t } = useLanguage();

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const base64Data = await convertFileToBase64(selectedFile);

      await apiRequest(
        'POST',
        `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/${documentNumber}/crossdocking/parse`,
        { data: base64Data, name: selectedFile.name, contentType: selectedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', color: selectedColor }
      );

      toast({ title: t('orders.crossdocking.uploadSuccess') });
      setSelectedFile(null);
      onUploadSuccess?.();
    } catch (error) {
      console.error('Crossdocking upload error:', error);
      toast({
        title: t('orders.crossdocking.uploadError'),
        description: error instanceof Error ? error.message : 'Failed to upload crossdocking file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <FileDropZone
        value={selectedFile}
        onChange={setSelectedFile}
        accept=".xlsx,.xls"
        maxSize={10}
      />
      {selectedFile && (
        <>
          <ReportColorSelector value={selectedColor} onChange={setSelectedColor} />
          <Button onClick={handleUpload} disabled={isUploading} className="w-full">
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isUploading ? '...' : t('orders.crossdocking.upload')}
          </Button>
        </>
      )}
    </div>
  );
}
