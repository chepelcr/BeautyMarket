import { useState } from 'react';
import type { ComplexSearchFilters } from '@/types/document';

interface ComplexSearchModalProps {
  filters: ComplexSearchFilters;
  onApply: (filters: ComplexSearchFilters) => void;
  onClose: () => void;
}

export function ComplexSearchModal({ filters, onApply, onClose }: ComplexSearchModalProps) {
  const [local, setLocal] = useState<ComplexSearchFilters>({ ...filters });
  const patch = (p: Partial<ComplexSearchFilters>) => setLocal((f) => ({ ...f, ...p }));

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-card border border-border shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="font-display font-bold text-[16px]">Búsqueda avanzada</span>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Search term */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Búsqueda libre</label>
            <input
              value={local.searchTerm ?? ''}
              onChange={(e) => patch({ searchTerm: e.target.value })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
              placeholder="Número consecutivo, nombre…"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estado</label>
            <select
              value={local.status ?? ''}
              onChange={(e) => patch({ status: (e.target.value as any) || undefined })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Todos</option>
              <option value="validated">Aceptados</option>
              <option value="pending">Pendientes</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Desde</label>
              <input
                type="date"
                value={local.start_date ?? ''}
                onChange={(e) => patch({ start_date: e.target.value || undefined })}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Hasta</label>
              <input
                type="date"
                value={local.end_date ?? ''}
                onChange={(e) => patch({ end_date: e.target.value || undefined })}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ordenar por</label>
            <select
              value={local.sort ?? ''}
              onChange={(e) => patch({ sort: e.target.value || undefined })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Fecha desc (por defecto)</option>
              <option value="sale_date,asc">Fecha asc</option>
              <option value="total_amount,desc">Monto desc</option>
              <option value="total_amount,asc">Monto asc</option>
              <option value="consecutive_number,desc">Consecutivo desc</option>
            </select>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-2">
          <button
            onClick={() => { patch({ searchTerm: undefined, status: undefined, start_date: undefined, end_date: undefined, sort: undefined }); }}
            className="flex-[0_0_80px] h-10 rounded-md border border-border text-[12px] text-muted-foreground hover:bg-muted"
          >
            Limpiar
          </button>
          <button
            onClick={() => { onApply(local); onClose(); }}
            className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
