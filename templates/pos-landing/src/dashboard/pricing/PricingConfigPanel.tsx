/**
 * PricingConfigPanel Component
 * Currency, USD rate, and subscription settings
 */

import { cn } from '@/lib/cn';
import { NumberField } from '../components';

interface PricingConfig {
  currency: 'CRC' | 'USD';
  usdRateCRC: number;
  freeDocs: number;
  moneyBackDays: number;
  annualDiscountMonths?: number;
  defaultBillingCycle?: 'monthly' | 'annual';
}

interface PricingConfigPanelProps {
  pricing: PricingConfig;
  onChange: (updates: Partial<PricingConfig>) => void;
}

export function PricingConfigPanel({ pricing, onChange }: PricingConfigPanelProps) {
  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-display font-bold text-base">Moneda y Configuración</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Moneda
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['CRC', 'USD'] as const).map(c => (
              <button
                key={c}
                onClick={() => onChange({ currency: c })}
                className={cn(
                  'h-10 rounded-md border-2 text-sm font-semibold transition',
                  pricing.currency === c 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:border-primary/40'
                )}
              >
                {c === 'CRC' ? '₡ Colones' : '$ USD'}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Tasa USD (₡ por $1)
          </label>
          <input
            type="number"
            value={pricing.usdRateCRC}
            onChange={e => onChange({ usdRateCRC: Number(e.target.value) })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:border-primary"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <NumberField 
          label="Docs Gratis / Mes" 
          value={pricing.freeDocs} 
          onChange={v => onChange({ freeDocs: v })} 
        />
        <NumberField 
          label="Días Garantía" 
          value={pricing.moneyBackDays} 
          onChange={v => onChange({ moneyBackDays: v })} 
        />
        <NumberField 
          label="Meses Gratis (Anual)" 
          value={pricing.annualDiscountMonths ?? 2} 
          onChange={v => onChange({ annualDiscountMonths: v })} 
        />
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Ciclo por Defecto
          </label>
          <div className="grid grid-cols-2 gap-1">
            {(['monthly', 'annual'] as const).map(c => (
              <button
                key={c}
                onClick={() => onChange({ defaultBillingCycle: c })}
                className={cn(
                  'h-10 rounded-md border-2 text-xs font-semibold transition',
                  pricing.defaultBillingCycle === c 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:border-primary/40'
                )}
              >
                {c === 'monthly' ? 'Mensual' : 'Anual'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
