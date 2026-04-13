import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteUrl: string;
  subdomain: string;
}

export function QRCodeDialog({
  open,
  onOpenChange,
  siteUrl,
  subdomain,
}: QRCodeDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when dialog closes
    if (!open) {
      setQrDataUrl(null);
      setError(null);
      return;
    }

    const generateQR = async () => {
      if (!siteUrl) {
        console.log('QR generation skipped: no siteUrl');
        return;
      }

      // Reset state
      setError(null);
      setQrDataUrl(null);

      try {
        console.log('Generating QR code for URL:', siteUrl);
        
        // Generate QR code as data URL
        const dataUrl = await QRCode.toDataURL(siteUrl, {
          errorCorrectionLevel: 'M',
          width: 256,
          margin: 4,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        
        console.log('QR code generated successfully');
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR code generation error:', err);
        setError('Failed to generate QR code');
      }
    };

    generateQR();
  }, [open, siteUrl]);

  const handleDownload = async () => {
    if (!qrDataUrl) {
      toast({
        title: 'Download failed',
        description: 'QR code not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${subdomain}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      toast({
        title: 'Download failed',
        description: 'Failed to download QR code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Site</DialogTitle>
          <DialogDescription>
            Scan this QR code to visit your site
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR code image */}
          {error ? (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : qrDataUrl ? (
            <div className="flex items-center justify-center bg-white p-4 rounded-lg">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Generating QR code...</p>
            </div>
          )}

          {/* Site URL display */}
          <div className="text-center">
            <p className="text-sm font-medium">{siteUrl}</p>
          </div>

          {/* Download button */}
          <Button
            onClick={handleDownload}
            disabled={!!error || !qrDataUrl}
            className="w-full"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
