import { useRef, useState } from 'react';
import { Loader2, Upload, FileSpreadsheet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface StoreUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: string, filename: string) => Promise<{ count: number }>;
}

export function StoreUploadModal({ isOpen, onClose, onUpload }: StoreUploadModalProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const base64 = await fileToBase64(selectedFile);
      const res = await onUpload(base64, selectedFile.name);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || t('stores.uploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t('stores.uploadTitle')}
          </DialogTitle>
          <DialogDescription>{t('stores.uploadDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {selectedFile ? (
              <p className="text-sm font-medium">{selectedFile.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{t('stores.selectFile')}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {result && (
            <p className="text-sm text-green-600 font-medium text-center">
              ✓ {result.count} {t('stores.uploadSuccess')}
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isUploading ? t('stores.uploading') : t('stores.uploadExcel')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip data URL prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
