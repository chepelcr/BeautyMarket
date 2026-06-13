import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { FileDropZone } from '@/components/ui/file-drop-zone';
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

      await apiRequest('POST', `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/parse`, {
        data: base64Data,
        name: selectedFile.name,
        contentType: selectedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      toast({ title: t('orders.excel.uploadSuccess') });
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

  return (
    <div className="space-y-4">
      <FileDropZone
        value={selectedFile}
        onChange={setSelectedFile}
        accept=".xlsx,.xls"
        maxSize={10}
      />
      {selectedFile && (
        <Button onClick={handleUpload} disabled={isUploading} className="w-full">
          {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isUploading ? t('orders.excel.processing') : t('orders.excel.parseOrder')}
        </Button>
      )}
    </div>
  );
}
