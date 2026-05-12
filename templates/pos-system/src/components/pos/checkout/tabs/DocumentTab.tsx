import { useAllSaleConditions } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { CurrencyCode } from '@/types/invoice';

interface DocumentTabData {
  sale_condition_id: number;
  activity_code: string;
  currency_code: CurrencyCode;
  notes: string;
}

interface DocumentTabProps {
  data: DocumentTabData;
  onChange: (patch: Partial<DocumentTabData>) => void;
}

export function DocumentTab({ data, onChange }: DocumentTabProps) {
  const { data: saleConditions } = useAllSaleConditions({ iso_code: CountryISO.COSTA_RICA });

  return (
    <div className="space-y-4">
      {/* Sale condition */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Condición de venta *
        </label>
        <select
          value={data.sale_condition_id}
          onChange={(e) => onChange({ sale_condition_id: Number(e.target.value) })}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
        >
          {(saleConditions ?? []).map((sc: any) => (
            <option key={sc.id} value={sc.id}>{sc.description}</option>
          ))}
        </select>
      </div>

      {/* Activity code */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Código de actividad *
        </label>
        <input
          value={data.activity_code}
          onChange={(e) => onChange({ activity_code: e.target.value })}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary font-mono"
          placeholder="722000"
          maxLength={20}
        />
      </div>

      {/* Currency */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Moneda
          </label>
          <select
            value={data.currency_code.iso_code}
            onChange={(e) => onChange({ currency_code: { ...data.currency_code, iso_code: e.target.value } })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
          >
            <option value="CRC">CRC — Colón</option>
            <option value="USD">USD — Dólar</option>
            <option value="EUR">EUR — Euro</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Tipo de cambio
          </label>
          <input
            type="number"
            value={data.currency_code.exchange_rate}
            onChange={(e) =>
              onChange({ currency_code: { ...data.currency_code, exchange_rate: parseFloat(e.target.value) || 1 } })
            }
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary font-mono"
            min={0}
            step={0.01}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Observaciones
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
          placeholder="Observaciones opcionales…"
        />
      </div>
    </div>
  );
}
