import { useAllFactoryTaxCharges } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { LineDetail } from '@/types/lineDetail';

interface OtherTabProps {
  detail: LineDetail;
  onChange: (patch: Partial<LineDetail>) => void;
}

export function OtherTab({ detail, onChange }: OtherTabProps) {
  const { data: factoryTaxCharges } = useAllFactoryTaxCharges({ iso_code: CountryISO.COSTA_RICA });

  return (
    <div className="space-y-4">
      {/* Factory tax charge */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Cargo por fábrica
        </label>
        <select
          value={detail.factory_tax_charge_id ?? ''}
          onChange={(e) => onChange({ factory_tax_charge_id: Number(e.target.value) || undefined })}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">Sin cargo de fábrica</option>
          {(factoryTaxCharges ?? []).map((f: any) => (
            <option key={f.factory_tax_charge_id} value={f.factory_tax_charge_id}>
              {f.description}
            </option>
          ))}
        </select>
      </div>

      {/* CABYS code display (read-only) */}
      {detail.cabys && (
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Código CABYS
          </label>
          <div className="h-10 rounded-md border border-border bg-muted/40 px-3 flex items-center font-mono text-sm text-muted-foreground">
            {detail.cabys}
          </div>
        </div>
      )}

      {/* Notes (stored as lineNote) */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Notas adicionales
        </label>
        <textarea
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
          placeholder="Observaciones o notas de la línea…"
        />
      </div>
    </div>
  );
}
