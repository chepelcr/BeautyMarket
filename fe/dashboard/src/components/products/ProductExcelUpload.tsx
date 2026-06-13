import { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileDropZone } from '@/components/ui/file-drop-zone';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Product } from '@/models';

interface ProductExcelUploadProps {
  organizationId: string;
  onUploadSuccess?: (products: Product[]) => void;
}

interface ProductListResponse {
  data: Product[];
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

const downloadTemplate = () => {
  const headers = [
    'COD_ARTIC',
    'COD_BARRA',
    'COD_INTERNO',
    'DESCRIPCION',
    'CANTIDAD_CAJA',
    'UNIDAD_MEDIDA',
    'PRECIO',
    'CATEGORIA'
  ];
  
  const exampleRow = [
    '17441119600000',
    '7441119600003',
    '2648022',
    'JUEGO SABANA BEBE BLANCA DOCOMA',
    '3.00',
    '',
    '0.00',
    'Bebé'
  ];
  
  const csvContent = [
    headers.join(','),
    exampleRow.join(',')
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'product-import-template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function ProductExcelUpload({ organizationId, onUploadSuccess }: ProductExcelUploadProps) {
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

      const response = await fetch(
        `${import.meta.env.VITE_PRODUCTS_API_URL}/api/organizations/${organizationId}/products/parse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: base64Data,
            name: selectedFile.name.replace(/\.[^/.]+$/, ''),
            contentType: selectedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result: ProductListResponse = await response.json();
      
      toast({ 
        title: t('products.excel.uploadSuccess'),
        description: t('products.excel.uploadSuccessDescription', { 
          count: String(result.pagination.totalElements) 
        })
      });
      
      setSelectedFile(null);
      onUploadSuccess?.(result.data);
    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = t('products.excel.uploadFailed');
      if (error instanceof Error) {
        if (error.message.includes('Could not open Excel file')) {
          errorMessage = t('products.excel.invalidFileFormat');
        } else if (error.message.includes('headers')) {
          errorMessage = t('products.excel.missingHeaders');
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t('products.excel.uploadFailed'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={downloadTemplate}
          disabled={isUploading}
        >
          <Download className="h-4 w-4 mr-2" />
          {t('products.excel.downloadTemplate')}
        </Button>
      </div>
      
      <FileDropZone
        value={selectedFile}
        onChange={setSelectedFile}
        accept=".xlsx,.xls"
        maxSize={5}
        disabled={isUploading}
      />
      
      {selectedFile && (
        <Button onClick={handleUpload} disabled={isUploading} className="w-full">
          {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isUploading ? t('products.excel.processing') : t('products.excel.uploadButton')}
        </Button>
      )}
    </div>
  );
}
