import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface SheetProps {
  title:    string;
  onClose:  () => void;
  children: ReactNode;
}

export function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-foreground/40 z-30 fade-anim"
    />
  );
}

export function Sheet({ title, onClose, children }: SheetProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-card rounded-t-2xl border-t border-border shadow-2xl shadow-foreground/30 sheet-anim flex flex-col"
      style={{ maxHeight: '85vh' }}
    >
      <div className="flex justify-center pt-2">
        <span className="w-10 h-1 rounded-full bg-border" />
      </div>
      <div className="px-5 py-3 flex items-center justify-between border-b border-border">
        <span className="font-display font-bold text-[17px]">{title}</span>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
      {children}
    </div>
  );
}
