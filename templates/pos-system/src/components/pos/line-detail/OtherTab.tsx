import { FileText } from 'lucide-react';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { useAllFactoryTaxCharges } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { LineDetail } from '@/types/lineDetail';

interface OtherTabProps {
  detail: LineDetail;
  onChange: (patch: Partial<LineDetail>) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function OtherTab({ detail, onChange, isExpanded, onToggle }: OtherTabProps) {
  const { data: factoryTaxCharges } = useAllFactoryTaxCharges({ iso_code: CountryISO.COSTA_RICA, document_version_id: 1 });

  return (
    <SectionWrapper
      title="Otros"
      icon={FileText}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Factory tax charge */}
        <div>
          <label className="pp-label">Cargo por fábrica</label>
          <select
            className="pp-input"
            value={detail.factory_tax_charge_id ?? ''}
            onChange={(e) => onChange({ factory_tax_charge_id: Number(e.target.value) || undefined })}
          >
            <option value="">Sin cargo de fábrica</option>
            {(factoryTaxCharges ?? []).map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.description}
              </option>
            ))}
          </select>
        </div>

        {/* CABYS code display (read-only) */}
        {detail.cabys && (
          <div>
            <label className="pp-label">Código CABYS</label>
            <div className="pp-input" style={{ background: 'hsl(var(--muted) / 0.4)', color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}>
              {detail.cabys}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="pp-label">Notas adicionales</label>
          <textarea
            className="pp-input"
            rows={3}
            placeholder="Observaciones o notas de la línea…"
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
