import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import { downloadBlob } from '@/lib/downloadUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface CrossdockingPDFPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  orderPdfUrl?: string;
  orderExcelUrl?: string;
  nuevoReporteUrl?: string;
  crossdockingExcelUrl?: string;
  title: string;
}

function getFileNameFromUrl(url: string): string {
  const path = new URL(url).pathname;
  return path.split('/').pop() || 'download';
}

async function downloadFromUrl(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  downloadBlob(blob, getFileNameFromUrl(url));
}

export function CrossdockingPDFPreview({ isOpen, onClose, pdfUrl, orderPdfUrl, orderExcelUrl, nuevoReporteUrl, crossdockingExcelUrl, title }: CrossdockingPDFPreviewProps) {
  const { t } = useLanguage();

  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <iframe
            src={viewerUrl}
            className="w-full h-full rounded-md border"
            title={title}
          />
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0">
          {crossdockingExcelUrl && (
            <Button variant="outline" onClick={() => downloadFromUrl(crossdockingExcelUrl)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Crossdocking Excel
            </Button>
          )}
          {nuevoReporteUrl && (
            <Button variant="outline" onClick={() => downloadFromUrl(nuevoReporteUrl)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Nuevo Reporte
            </Button>
          )}
          <Button variant="outline" onClick={() => downloadFromUrl(pdfUrl)}>
            <Download className="h-4 w-4 mr-2" />
            Crossdocking PDF
          </Button>
          {orderPdfUrl && (
            <Button variant="outline" onClick={() => downloadFromUrl(orderPdfUrl)}>
              <FileText className="h-4 w-4 mr-2" />
              Order PDF
            </Button>
          )}
          {orderExcelUrl && (
            <Button variant="outline" onClick={() => downloadFromUrl(orderExcelUrl)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Order Excel
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            {t('common.close') || 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
