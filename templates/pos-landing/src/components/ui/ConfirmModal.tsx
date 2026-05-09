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
  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[60] bg-foreground/50 fade-anim flex items-center justify-center p-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-card border border-border shadow-2xl shadow-foreground/30 overflow-hidden sheet-anim"
      >
        <div className="p-5 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${destructive ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'}`}>
            <Icon name="Trash" size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-base">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-md border border-border text-sm font-semibold hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`h-9 px-4 rounded-md text-sm font-semibold text-white ${destructive ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
