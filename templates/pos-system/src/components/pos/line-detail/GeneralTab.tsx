import { Package } from 'lucide-react';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { FormLabel } from '@/components/ui';
import { useAllMeasurementUnits } from '@/hooks/useDataApi';
import type { LineDetail } from '@/types/lineDetail';

interface GeneralTabProps {
  detail: LineDetail;
  onChange: (patch: Partial<LineDetail>) => void;
  isExpanded: boolean;
  onToggle: () => void;
  isExportInvoice?: boolean;
}

export function GeneralTab({ detail, onChange, isExpanded, onToggle, isExportInvoice = false }: GeneralTabProps) {
  const { data: measurementUnits } = useAllMeasurementUnits();
  
  // Find the selected unit
  const selectedUnit = (measurementUnits ?? []).find((u: any) => u.id === detail.unit_id);
  const selectedUnitCode = selectedUnit?.code;
  
  // Show commercial unit field only if unit code is "Otros"
  const showCommercialUnit = selectedUnitCode === 'Otros';
  
  // Handle unit change - auto-set commercial_unit_measure to unit code if not "Otros"
  const handleUnitChange = (unitId: number | undefined) => {
    const unit = (measurementUnits ?? []).find((u: any) => u.id === unitId);
    const unitCode = unit?.code;
    
    if (unitCode === 'Otros') {
      // Keep existing commercial_unit_measure or clear it
      onChange({ unit_id: unitId });
    } else {
      // Auto-set commercial_unit_measure to unit code
      onChange({ 
        unit_id: unitId, 
        commercial_unit_measure: unitCode || undefined 
      });
    }
  };

  return (
    <SectionWrapper
      title="General"
      icon={Package}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Description */}
        <div>
          <FormLabel required>
            Descripción
          </FormLabel>
          <input
            className="pp-input"
            value={detail.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Descripción del producto o servicio"
            maxLength={200}
          />
        </div>

        {/* Quantity + Price + Unit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div>
            <FormLabel required>
              Cantidad
            </FormLabel>
            <input
              className="pp-input"
              type="number"
              value={detail.quantity}
              onChange={(e) => onChange({ quantity: parseFloat(e.target.value) || 0 })}
              min={0.001}
              step={0.001}
            />
          </div>
          <div>
            <FormLabel required>
              Precio neto
            </FormLabel>
            <input
              className="pp-input"
              type="number"
              value={detail.net_price}
              onChange={(e) => onChange({ net_price: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <FormLabel required>
              Unidad
            </FormLabel>
            <select
              className="pp-input"
              value={detail.unit_id ?? ''}
              onChange={(e) => handleUnitChange(Number(e.target.value) || undefined)}
            >
              <option value="">—</option>
              {(measurementUnits ?? []).map((u: any) => (
                <option key={u.id} value={u.id}>{u.code} — {u.description}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional fields - conditional layout based on unit and document type */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: showCommercialUnit && isExportInvoice ? '1fr 1fr' : '1fr', 
          gap: 8 
        }}>
          {showCommercialUnit && (
            <div>
              <FormLabel required>
                Unidad comercial
              </FormLabel>
              <input
                className="pp-input"
                value={detail.commercial_unit_measure || ''}
                onChange={(e) => onChange({ commercial_unit_measure: e.target.value })}
                maxLength={20}
                placeholder="Ej: Caja, Paquete, etc."
              />
            </div>
          )}
          {isExportInvoice && (
            <div>
              <FormLabel>Partida arancelaria</FormLabel>
              <input
                className="pp-input"
                value={detail.customs_part || ''}
                onChange={(e) => onChange({ customs_part: e.target.value })}
                maxLength={12}
                placeholder="123456789012"
              />
            </div>
          )}
        </div>

        {/* Subtotal display */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid hsl(var(--border))' }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Subtotal línea</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            ₡{(detail.quantity * detail.net_price).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </SectionWrapper>
  );
}
