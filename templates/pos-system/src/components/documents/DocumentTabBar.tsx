import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store/documentStore';
import type { DocumentTab } from '@/store/documentStore';

interface DocumentTabBarProps {
  tabs: DocumentTab[];
  activeId: string | null;
}

export function DocumentTabBar({ tabs, activeId }: DocumentTabBarProps) {
  const { setActiveDocumentTab, removeDocumentTab, setViewMode } = useDocumentStore();

  if (tabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="text-4xl opacity-30">📄</span>
        <div className="text-[14px] text-muted-foreground">No hay documentos abiertos</div>
        <button
          onClick={() => setViewMode('list')}
          className="h-9 px-4 rounded-md border border-border text-[13px] text-muted-foreground hover:bg-muted"
        >
          Ir a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="flex border-b border-border bg-card overflow-x-auto shrink-0">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5 cursor-pointer border-b-2 shrink-0 select-none',
            activeId === tab.id
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          onClick={() => setActiveDocumentTab(tab.id)}
        >
          <span className="text-[12px] font-semibold">{tab.title}</span>
          {tab.is_dirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" title="Cambios sin guardar" />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); removeDocumentTab(tab.id); }}
            className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-0.5"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
