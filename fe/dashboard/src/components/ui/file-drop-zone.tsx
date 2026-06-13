import { useState, useRef, useEffect } from 'react';
import { Upload, X, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface FileDropZoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAcceptFilter(file: File, accept: string): boolean {
  if (!accept || accept === '*') return true;

  const filters = accept.split(',').map(f => f.trim().toLowerCase());
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return filters.some(filter => {
    if (filter.startsWith('.')) {
      return fileName.endsWith(filter);
    }
    if (filter.endsWith('/*')) {
      const category = filter.slice(0, -2);
      return fileType.startsWith(category + '/');
    }
    return fileType === filter;
  });
}

export function FileDropZone({
  value,
  onChange,
  accept,
  maxSize = 10,
  placeholder,
  disabled = false,
  label,
  className,
}: FileDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (value && isImageFile(value)) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [value]);

  const validateAndSet = (file: File) => {
    setError(null);

    if (accept && accept !== '*' && !matchesAcceptFilter(file, accept)) {
      setError(t('fileDropZone.invalidType'));
      return;
    }

    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(t('fileDropZone.fileTooLarge', { maxSize: String(maxSize) }));
      return;
    }

    onChange(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    setError(null);
    onChange(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      {value && previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt={t('fileDropZone.preview')}
            className="w-full h-32 object-cover rounded-lg border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : value ? (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm flex-1 truncate">{value.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatFileSize(value.size)}
          </span>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-6 w-6 p-0 shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {placeholder || t('fileDropZone.dragText')}{' '}
              {!placeholder && (
                <span className="text-primary underline">
                  {t('fileDropZone.selectFile')}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('fileDropZone.maxSize', { maxSize: String(maxSize) })}
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
