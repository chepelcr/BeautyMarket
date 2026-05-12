import { cn } from '@/lib/utils';

interface PosHeaderProps {
  branchName: string;
  terminalCode: number;
  userName: string;
  syncStatus: string;
}

export function PosHeader({ branchName, terminalCode, userName, syncStatus }: PosHeaderProps) {
  const isOnline = syncStatus === 'online';

  return (
    <div className="h-[52px] flex items-center justify-between px-5 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-[18px] leading-none">Punto de venta</span>
        <span className="text-muted-foreground text-xs">·</span>
        <span className="text-[13px] text-muted-foreground">
          {branchName} · Terminal {terminalCode}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-muted-foreground hidden md:inline">{userName}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border',
            isOnline
              ? 'bg-success/12 text-success border-success/30'
              : 'bg-muted text-muted-foreground border-border'
          )}
        >
          <span
            className={cn(
              'w-[7px] h-[7px] rounded-full',
              isOnline ? 'bg-success' : 'bg-muted-foreground'
            )}
          />
          {isOnline ? 'En línea' : syncStatus === 'syncing' ? 'Sincronizando' : 'Sin conexión'}
        </span>
      </div>
    </div>
  );
}
