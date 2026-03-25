import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react';
import { FileDropZone } from '@/components/ui/file-drop-zone';
import { useToast } from '@/hooks/use-toast';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  folder?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  label,
  accept = "image/*",
  maxSize = 5,
  folder = "images",
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  const { t } = useLanguage();

  const uploadFile = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: t("imageUpload.error"),
        description: t("imageUpload.fileTooLarge", { maxSize: String(maxSize) }),
        variant: "destructive",
      });
      return;
    }

    if (!user?.id || !defaultOrg?.id) {
      toast({
        title: t("imageUpload.error"),
        description: t("imageUpload.contextError"),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get presigned URL using the S3 upload endpoint
      const response = await fetch(buildOrgApiUrl(user.id, defaultOrg.id, '/objects/upload'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = await response.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 Upload failed:', uploadResponse.status, errorText);
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      onChange(fileUrl);
      toast({
        title: t("imageUpload.success"),
        description: t("imageUpload.successDescription"),
      });
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = t("imageUpload.uploadFailed");

      if (error instanceof Error) {
        if (error.message.includes('Failed to get upload URL')) {
          errorMessage = t("imageUpload.urlError");
        } else if (error.message.includes('Failed to upload file')) {
          errorMessage = t("imageUpload.s3Error");
        } else {
          errorMessage = `${t("imageUpload.error")}: ${error.message}`;
        }
      }

      toast({
        title: t("imageUpload.uploadError"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelected = (file: File | null) => {
    if (file) uploadFile(file);
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={t("imageUpload.preview")}
            className="w-full h-32 object-cover rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="12" fill="%23666">Error</text></svg>';
            }}
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={removeImage}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : isUploading ? (
        <div className="border-2 border-dashed rounded-lg p-6 text-center border-muted-foreground/25">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t("imageUpload.uploading")}
            </p>
          </div>
        </div>
      ) : (
        <FileDropZone
          value={null}
          onChange={handleFileSelected}
          accept={accept}
          maxSize={maxSize}
          disabled={disabled}
        />
      )}
    </div>
  );
}