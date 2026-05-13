import { DollarSign } from 'lucide-react';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { useAllTaxes } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { LineDetail } from '@/types/lineDetail';

const fmt = (n: number) => '₡' + Math.round(n).toLocaleString('es-CR');
const IVA_CODES = ['01', '07', '08'];

interface CommercialValueSectionProps {
  detail: LineDetail;
  subtotalAfterDiscount: number;
  lineAmounts: {
    total_amount_line: number;
    net_tax: number;
    factory_assumed_tax: number;
    base_amount: number;
    iva_tax_total: number;
    other_tax_total: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

export function CommercialValueSection({ 
  detail, 
  subtotalAfterDiscount,
  lineAmounts,
  isExpanded, 
  onToggle 
}: CommercialValueSectionProps) {
  const { data: taxTypes } = useAllTaxes({ iso_code: CountryISO.COSTA_RICA });
  
  const basePrice = detail.net_price * detail.quantity;
  const discountAmount = basePrice - subtotalAfterDiscount;
  const totalLine = lineAmounts.total_amount_line;
  const factoryAssumedTax = lineAmounts.factory_assumed_tax;
  const baseAmount = lineAmounts.base_amount;
  const ivaTaxTotal = lineAmounts.iva_tax_total;
  const otherTaxTotal = lineAmounts.other_tax_total;

  // Check if we have IVA taxes
  const hasIvaTaxes = detail.taxes.some((t) => {
    const tt = (taxTypes ?? []).find((x: any) => x.id === t.tax_type_id);
    return IVA_CODES.includes(tt?.code ?? '');
  });

  return (
    <SectionWrapper
      title="Valor Comercial"
      icon={DollarSign}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div
        style={{
          padding: '14px 16px',
          background: 'hsl(var(--primary) / 0.06)',
          borderRadius: 10,
          border: '1.5px solid hsl(var(--primary) / 0.3)',
        }}
      >
        {/* Total header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span className="t-label" style={{ color: 'hsl(var(--primary))' }}>
            Total Línea
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'hsl(var(--primary))',
              fontFamily: 'var(--font-display)',
            }}
          >
            {fmt(totalLine)}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Base price */}
          <Row label="Precio base" value={fmt(basePrice)} />

          {/* Total discounts (if any) */}
          {discountAmount > 0 && (
            <Row
              label="Descuentos"
              value={`-${fmt(discountAmount)}`}
              color="hsl(var(--destructive))"
            />
          )}

          {/* Net price after discounts */}
          {discountAmount > 0 && (
            <>
              <div style={{ borderTop: '1px solid hsl(var(--border) / 0.4)', margin: '4px 0' }} />
              <Row
                label="Neto después de descuentos"
                value={fmt(subtotalAfterDiscount)}
                bold
              />
            </>
          )}

          {/* Base for IVA — shown when there are IVA taxes */}
          {hasIvaTaxes && (
            <>
              <div style={{ borderTop: '1px solid hsl(var(--border) / 0.4)', margin: '4px 0' }} />
              <Row
                label="Base para IVA"
                value={fmt(baseAmount)}
                bold
                color="hsl(var(--foreground))"
              />
            </>
          )}

          {/* Factory assumed tax */}
          {factoryAssumedTax > 0 && (
            <Row
              label="Asumido por fábrica"
              value={`-${fmt(factoryAssumedTax)}`}
              color="hsl(var(--warning, 38 92% 50%))"
            />
          )}

          {/* Tax Totals */}
          {(ivaTaxTotal > 0 || otherTaxTotal > 0) && (
            <>
              <div style={{ borderTop: '1px solid hsl(var(--border) / 0.5)', margin: '4px 0' }} />
              {ivaTaxTotal > 0 && (
                <Row label="Total IVA" value={`+${fmt(ivaTaxTotal)}`} bold />
              )}
              {otherTaxTotal > 0 && (
                <Row label="Total otros impuestos" value={`+${fmt(otherTaxTotal)}`} bold />
              )}
            </>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span
        className="t-xs"
        style={{ color: color ?? 'hsl(var(--muted-foreground))', fontWeight: bold ? 700 : undefined }}
      >
        {label}
      </span>
      <span
        className="t-xs"
        style={{ color: color ?? 'hsl(var(--muted-foreground))', fontWeight: bold ? 700 : undefined }}
      >
        {value}
      </span>
    </div>
  );
}
