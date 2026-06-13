import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileDropZone } from '@/components/ui/file-drop-zone';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { ReportColorSelector, getDefaultColorForDepartment } from './ReportColorSelector';
import type { Order, ReportColorScheme } from '@/models';

interface CrossdockingUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  organizationId: string;
  documentNumber: string;
  onSuccess?: (updatedOrder: Order) => void;
}

export function CrossdockingUploadDialog({ open, onOpenChange, order, organizationId, documentNumber, onSuccess }: CrossdockingUploadDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [color, setColor] = useState<ReportColorScheme>(
    order.report_color || getDefaultColorForDepartment(order.department)
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    toast({ title: t('orders.crossdocking.uploading') });

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
      });

      const response = await apiRequest(
        'POST',
        `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders/${documentNumber}/crossdocking/parse`,
        { data: base64Data, name: selectedFile.name, contentType: selectedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', color }
      );
      const updatedOrder: Order = await response.json();
      toast({ title: t('orders.crossdocking.uploadSuccess') });
      setSelectedFile(null);
      onOpenChange(false);
      onSuccess?.(updatedOrder);
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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) {
          setColor(order.report_color || getDefaultColorForDepartment(order.department));
        } else {
          setSelectedFile(null);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('orders.crossdocking.upload')}</DialogTitle>
          <DialogDescription>
            {t('orders.colorScheme.uploadDescription') || 'Select the report color scheme for the crossdocking report.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <FileDropZone
            value={selectedFile}
            onChange={setSelectedFile}
            accept=".xlsx,.xls"
            maxSize={10}
            disabled={isUploading}
          />
          
          {selectedFile && (
            <div className="py-2">
              <Label className="text-sm font-medium mb-3 block">
                {t('orders.colorScheme.label') || 'Color del reporte'}
              </Label>
              <ReportColorSelector value={color} onChange={setColor} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            {t('common.cancel') || 'Cancelar'}
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('orders.crossdocking.upload')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
