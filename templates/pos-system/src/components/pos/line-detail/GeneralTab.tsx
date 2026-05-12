import { useAllMeasurementUnits } from '@/hooks/useDataApi';
import type { LineDetail } from '@/types/lineDetail';

interface GeneralTabProps {
  detail: LineDetail;
  onChange: (patch: Partial<LineDetail>) => void;
  hasIvace: boolean;
  hasFactoryTax: boolean;
}

export function GeneralTab({ detail, onChange, hasIvace, hasFactoryTax }: GeneralTabProps) {
  const { data: measurementUnits } = useAllMeasurementUnits();
  const baseAmountEditable = hasIvace || hasFactoryTax;

  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Descripción *
        </label>
        <input
          value={detail.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
          placeholder="Descripción del producto o servicio"
          maxLength={200}
        />
      </div>

      {/* Quantity + Price + Unit */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Cantidad *
          </label>
          <input
            type="number"
            value={detail.quantity}
            onChange={(e) => onChange({ quantity: parseFloat(e.target.value) || 0 })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary font-mono"
            min={0.001}
            step={0.001}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Precio neto *
          </label>
          <input
            type="number"
            value={detail.net_price}
            onChange={(e) => onChange({ net_price: parseFloat(e.target.value) || 0 })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary font-mono"
            min={0}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Unidad *
          </label>
          <select
            value={detail.unit_id ?? ''}
            onChange={(e) => onChange({ unit_id: Number(e.target.value) || undefined })}
            className="w-full h-10 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">—</option>
            {(measurementUnits ?? []).map((u: any) => (
              <option key={u.unit_id} value={u.unit_id}>{u.code} — {u.description}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Unidad comercial
          </label>
          <input
            value={detail.commercial_unit_measure || ''}
            onChange={(e) => onChange({ commercial_unit_measure: e.target.value })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
            maxLength={20}
            placeholder="Ej: Caja"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Partida arancelaria
          </label>
          <input
            value={detail.customs_part || ''}
            onChange={(e) => onChange({ customs_part: e.target.value })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary font-mono"
            maxLength={12}
            placeholder="123456789012"
          />
        </div>
      </div>

      {/* Base amount — only editable when IVACE or factory tax */}
      <div className="space-y-1">
        <label className={`text-[11px] font-display font-bold uppercase tracking-wider ${baseAmountEditable ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
          Monto base {!baseAmountEditable && '(solo editable con IVACE o cargo de fábrica)'}
        </label>
        <input
          type="number"
          value={detail.base_amount ?? ''}
          onChange={(e) => onChange({ base_amount: parseFloat(e.target.value) || undefined })}
          disabled={!baseAmountEditable}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary font-mono disabled:opacity-40 disabled:cursor-not-allowed"
          min={0}
          step={0.01}
        />
      </div>

      {/* Subtotal display */}
      <div className="flex justify-between items-center py-2 border-t border-border">
        <span className="text-[12px] text-muted-foreground">Subtotal línea</span>
        <span className="font-mono font-semibold t-num">
          ₡{(detail.quantity * detail.net_price).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
