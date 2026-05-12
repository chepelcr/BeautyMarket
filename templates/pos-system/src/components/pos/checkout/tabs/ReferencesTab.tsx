import { useAllReferences, useAllReferenceCodes } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { SaleReference } from '@/types/reference';

interface ReferencesTabProps {
  references: SaleReference[];
  onChange: (refs: SaleReference[]) => void;
}

const BLANK_REF: SaleReference = {
  reference_type_id: 1,
  document_number: '',
  reference_date: new Date().toISOString().slice(0, 10),
  reference_code: 1,
  reason: '',
};

export function ReferencesTab({ references, onChange }: ReferencesTabProps) {
  const { data: referenceTypes } = useAllReferences({ iso_code: CountryISO.COSTA_RICA });
  const { data: referenceCodes } = useAllReferenceCodes({ iso_code: CountryISO.COSTA_RICA });

  const add = () => onChange([...references, { ...BLANK_REF }]);
  const remove = (i: number) => onChange(references.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<SaleReference>) =>
    onChange(references.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-3">
      {references.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No hay referencias. Las referencias son requeridas para Notas de Crédito y Débito.
        </div>
      )}

      {references.map((ref, i) => (
        <div key={i} className="rounded-md border border-border p-3 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold">Referencia #{i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="text-[11px] text-muted-foreground hover:text-destructive"
            >
              Eliminar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Tipo *
              </label>
              <select
                value={ref.reference_type_id}
                onChange={(e) => update(i, { reference_type_id: Number(e.target.value) })}
                className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
              >
                {(referenceTypes ?? []).map((rt: any) => (
                  <option key={rt.id} value={rt.id}>{rt.description}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Código *
              </label>
              <select
                value={ref.reference_code}
                onChange={(e) => update(i, { reference_code: Number(e.target.value) })}
                className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
              >
                {(referenceCodes ?? []).map((rc: any) => (
                  <option key={rc.id} value={rc.id}>{rc.description}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Número documento *
              </label>
              <input
                value={ref.document_number}
                onChange={(e) => update(i, { document_number: e.target.value })}
                className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
                placeholder="50601…"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fecha *
              </label>
              <input
                type="date"
                value={ref.reference_date}
                onChange={(e) => update(i, { reference_date: e.target.value })}
                className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Razón
            </label>
            <input
              value={ref.reason || ''}
              onChange={(e) => update(i, { reason: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Motivo de la referencia"
            />
          </div>
        </div>
      ))}

      <button
        onClick={add}
        className="w-full h-9 rounded-md border border-dashed border-border text-[12px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        + Agregar referencia
      </button>
    </div>
  );
}
