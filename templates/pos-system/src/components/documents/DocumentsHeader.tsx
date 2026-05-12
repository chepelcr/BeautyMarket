import { cn } from '@/lib/utils';
import { useDocumentStore, newDocTabId } from '@/store/documentStore';
import { DOCUMENT_TYPES } from '@/types/invoice';
import type { DocTypeCode } from '@/types/invoice';

export function DocumentsHeader() {
  const { view_mode, setViewMode, addDocumentTab } = useDocumentStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const createDoc = (docType: typeof DOCUMENT_TYPES[number]) => {
    setShowDropdown(false);
    addDocumentTab({
      id: newDocTabId(),
      type: 'new',
      title: docType.short,
      doc_type: docType.code as DocTypeCode,
      data: { document_type: docType.code as DocTypeCode },
      is_dirty: false,
    });
  };

  return (
    <div className="h-[52px] flex items-center justify-between px-5 border-b border-border bg-card shrink-0">
      <span className="font-display font-bold text-[18px]">Documentos</span>

      <div className="flex items-center gap-3">
        {/* View mode toggle */}
        <div className="flex rounded-md border border-border bg-muted p-0.5">
          {(['list', 'tabs'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-3 py-1 rounded text-[12px] font-semibold transition-colors',
                view_mode === mode
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {mode === 'list' ? 'Lista' : 'Pestañas'}
            </button>
          ))}
        </div>

        {/* New document dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold flex items-center gap-1.5"
          >
            + Nuevo
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-11 z-20 w-56 rounded-lg border border-border bg-card shadow-lg py-1">
              {DOCUMENT_TYPES.map((dt) => (
                <button
                  key={dt.code}
                  onClick={() => createDoc(dt)}
                  className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-muted flex items-center gap-3"
                >
                  <span className={cn('text-[11px] font-bold', dt.color)}>{dt.short}</span>
                  <span>{dt.label}</span>
                </button>
              ))}
            </div>
          )}
          {showDropdown && (
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          )}
        </div>
      </div>
    </div>
  );
}

// useState needs to be imported
import { useState } from 'react';
