import { useEffect, useState } from 'react';
import { Icon } from './Icon';

interface ConfirmModalProps {
  title:        string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?:  string;
  destructive?: boolean;
  onConfirm:    () => void;
  onCancel:     () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel  = 'Cancel',
  destructive  = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Trigger animation on next frame
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    
    return () => {
      cancelAnimationFrame(timer);
      document.body.style.overflow = '';
    };
  }, []);

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  };

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(onConfirm, 200);
  };

  return (
    <div
      onClick={handleCancel}
      className={`fixed z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        margin: 0,
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-sm rounded-xl bg-card text-card-foreground border border-border shadow-2xl overflow-hidden transition-all duration-200 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <div className="p-5 flex items-start gap-3 bg-card">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${destructive ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'}`}>
            <Icon name="Trash" size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-base text-card-foreground">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="h-9 px-4 rounded-md border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`h-9 px-4 rounded-md text-sm font-semibold text-white transition-colors ${destructive ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
