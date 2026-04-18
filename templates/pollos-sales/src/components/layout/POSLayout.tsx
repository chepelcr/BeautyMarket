import { cn } from "@/lib/utils";
import type { SyncStatus } from "@/hooks/useSync";
import { useAuthContext } from "@/contexts/AuthContext";

const syncConfig: Record<SyncStatus, { color: string; label: string; dot: string }> = {
  online: { color: "text-success", label: "Online", dot: "●" },
  offline: { color: "text-destructive", label: "Offline", dot: "●" },
  syncing: { color: "text-warning", label: "Sincronizando...", dot: "◌" },
};

interface POSLayoutProps {
  children: React.ReactNode;
  syncStatus: SyncStatus;
  standName?: string;
  context?: string;
  sessionName?: string;
}

export default function POSLayout({
  children,
  syncStatus,
  standName,
  context,
  sessionName,
}: POSLayoutProps) {
  const { logout } = useAuthContext();
  const sync = syncConfig[syncStatus];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-border shrink-0">
        <span className="font-barlow font-extrabold text-lg text-primary tracking-wide">
          🍗 POLLOS PORTEÑOS
        </span>
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-1 text-xs font-mono", sync.color)}>
            <span className="text-[9px]">{sync.dot}</span>
            <span>{sync.label}</span>
          </div>
          <button
            onClick={logout}
            className="text-muted text-xs hover:text-foreground transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Assignment badge */}
      {standName && (
        <div className="px-4 py-1.5 bg-primary/10 border-b border-primary/20 shrink-0">
          <span className="text-[11px] text-primary font-barlow font-bold tracking-wide">
            📍 {standName}
            {context && ` · ${context.toUpperCase()}`}
            {sessionName && ` · ${sessionName}`}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
