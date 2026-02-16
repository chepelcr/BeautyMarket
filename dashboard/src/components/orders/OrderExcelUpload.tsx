import { useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderExcelUploadProps {
  organizationId: string;
  onUploadSuccess?: () => void;
}

export function OrderExcelUpload({ organizationId, onUploadSuccess }: OrderExcelUploadProps) {
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
          title: t('orders.excel.invalidFileType'),
          description: t('orders.excel.invalidFileTypeDescription'),
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

      const response = await fetch(`${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: base64Data,
          name: selectedFile.name,
          contentType: selectedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      toast({
        title: t('orders.excel.uploadSuccess'),
      });

      setSelectedFile(null);
      onUploadSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('orders.excel.uploadFailed'),
        description: error instanceof Error ? error.message : 'Failed to upload and parse Excel file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="w-full">
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer w-full">
              <Upload className="h-4 w-4 mr-2" />
              {t('orders.excel.selectFile')}
            </div>
          </label>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span className="text-sm flex-1">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? t('orders.excel.processing') : t('orders.excel.parseOrder')}
          </Button>
        </>
      )}
    </div>
  );
}
