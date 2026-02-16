import { useState } from 'react';
import { Upload, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface CrossdockingUploadProps {
  organizationId: string;
  documentNumber: string;
  onUploadSuccess?: () => void;
}

export function CrossdockingUpload({ organizationId, documentNumber, onUploadSuccess }: CrossdockingUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please select an Excel file (.xlsx or .xls)',
          variant: 'destructive',
        });
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const base64Data = await convertFileToBase64(selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/${documentNumber}/crossdocking/parse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: base64Data,
            name: selectedFile.name,
            contentType: selectedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      toast({
        title: t('orders.crossdocking.uploadSuccess'),
      });

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

  const inputId = `crossdocking-upload-${documentNumber}`;

  return (
    <div className="flex items-center gap-2">
      {!selectedFile ? (
        <>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id={inputId}
          />
          <label htmlFor={inputId} className="cursor-pointer">
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
              <Upload className="h-4 w-4 mr-2" />
              {t('orders.crossdocking.upload')}
            </div>
          </label>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm">
            <FileSpreadsheet className="h-4 w-4 text-green-600 shrink-0" />
            <span className="truncate max-w-[150px]">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="shrink-0">
              <X className="h-3 w-3" />
            </button>
          </div>
          <Button size="sm" onClick={handleUpload} disabled={isUploading}>
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isUploading ? '...' : t('orders.crossdocking.upload')}
          </Button>
        </>
      )}
    </div>
  );
}
