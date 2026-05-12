/**
 * PlanCard Component
 * Complete plan editor orchestrator
 */

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { fmtCRC, fmtUSD } from '@/lib/format';
import { FeatureRow } from './FeatureRow';
import { FeatureAddDropdown } from './FeatureAddDropdown';
import type { Plan, FeatureDef, PlanFeature } from './types';

interface PlanCardProps {
  plan: Plan;
  currency: 'CRC' | 'USD';
  usdRate: number;
  masterFeatures: FeatureDef[];
  onChange: (p: Plan) => void;
  onDelete: () => void;
  isLastPlan?: boolean;
}

export function PlanCard({ 
  plan, 
  currency, 
  usdRate, 
  masterFeatures, 
  onChange, 
  onDelete, 
  isLastPlan = false 
}: PlanCardProps) {
  const set = <K extends keyof Plan>(key: K, val: Plan[K]) => onChange({ ...plan, [key]: val });
  const [draggedFeatureIndex, setDraggedFeatureIndex] = useState<number | null>(null);

  const fmt = (n: number) => currency === 'USD' ? fmtUSD(n, usdRate) : fmtCRC(n);

  const setFeature = (i: number, f: PlanFeature) => {
    const features = [...plan.features];
    features[i] = f;
    onChange({ ...plan, features });
  };

  const addFeatureBlank = () => onChange({
    ...plan,
    features: [...plan.features, { label: 'New feature', enabled: true, color: 'success' }],
  });

  const addFeatureFromMaster = (def: FeatureDef) => onChange({
    ...plan,
    features: [...plan.features, { id: def.id, label: def.label, enabled: true, color: 'success' }],
  });

  const removeFeature = (i: number) => onChange({
    ...plan,
    features: plan.features.filter((_, idx) => idx !== i),
  });

  const handleFeatureDragStart = (i: number) => {
    setDraggedFeatureIndex(i);
  };

  const handleFeatureDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (draggedFeatureIndex === null || draggedFeatureIndex === i) return;
    
    const newFeatures = [...plan.features];
    const draggedItem = newFeatures[draggedFeatureIndex];
    newFeatures.splice(draggedFeatureIndex, 1);
    newFeatures.splice(i, 0, draggedItem);
    
    onChange({ ...plan, features: newFeatures });
    setDraggedFeatureIndex(i);
  };

  const handleFeatureDragEnd = () => {
    setDraggedFeatureIndex(null);
  };

  return (
    <div className={cn('card p-5 space-y-4', plan.highlighted && 'border-primary border-2')}>
      {/* Header — name + badge + delete */}
      <div className="flex items-start gap-3">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nombre</label>
            <input
              type="text"
              value={plan.name}
              onChange={e => set('name', e.target.value)}
              className="w-full h-9 rounded border border-border bg-background px-2 text-sm font-semibold focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Insignia</label>
            <input
              type="text"
              value={plan.badge ?? ''}
              onChange={e => set('badge', e.target.value)}
              placeholder="ej., Recomendado"
              className="w-full h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <button
          onClick={onDelete}
          className="w-9 h-9 mt-5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center"
          title="Eliminar plan"
        >
          <Icon name="Trash" size={15} />
        </button>
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Eslogan</label>
        <input
          type="text"
          value={plan.tagline}
          onChange={e => set('tagline', e.target.value)}
          className="w-full h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Subscription Pricing */}
      <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Precios de Suscripción</label>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Precio Mensual (₡)</label>
            <input
              type="number"
              value={plan.priceMonthly ?? ''}
              onChange={e => set('priceMonthly', e.target.value === '' ? undefined : Number(e.target.value))}
              className="w-full h-9 rounded border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:border-primary"
              placeholder="20000"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Precio Anual (₡)</label>
            <input
              type="number"
              value={plan.priceAnnual ?? ''}
              onChange={e => set('priceAnnual', e.target.value === '' ? undefined : Number(e.target.value))}
              className="w-full h-9 rounded border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:border-primary"
              placeholder="200000"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Sugerido: {plan.priceMonthly ? `₡${((plan.priceMonthly ?? 0) * 10).toLocaleString()}` : '—'} (10 meses)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sufijo Mensual</label>
            <input
              type="text"
              value={plan.priceSuffixMonthly ?? ''}
              onChange={e => set('priceSuffixMonthly', e.target.value)}
              className="w-full h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
              placeholder="/ mes"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sufijo Anual</label>
            <input
              type="text"
              value={plan.priceSuffixAnnual ?? ''}
              onChange={e => set('priceSuffixAnnual', e.target.value)}
              className="w-full h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
              placeholder="/ año"
            />
          </div>
        </div>
      </div>

      {/* CTA + flags */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Etiqueta CTA</label>
          <input
            type="text"
            value={plan.ctaLabel}
            onChange={e => set('ctaLabel', e.target.value)}
            className="w-full h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Enlace CTA</label>
          <input
            type="text"
            value={plan.ctaHref}
            onChange={e => set('ctaHref', e.target.value)}
            className="w-full h-9 rounded border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.highlighted}
            onChange={e => set('highlighted', e.target.checked)}
            className="accent-primary"
          />
          <span>Destacado (borde + brillo)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.showAmortization}
            onChange={e => set('showAmortization', e.target.checked)}
            className="accent-primary"
          />
          <span>Mostrar línea de amortización</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.showMoneyBack}
            onChange={e => set('showMoneyBack', e.target.checked)}
            className="accent-primary"
          />
          <span>Mostrar garantía de devolución</span>
        </label>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sublínea</label>
        <input
          type="text"
          value={plan.subline ?? ''}
          onChange={e => set('subline', e.target.value)}
          className="w-full h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
          placeholder="Texto pequeño debajo del precio"
        />
      </div>

      {/* Features list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Características ({plan.features.length})
          </label>
          <FeatureAddDropdown
            masterFeatures={masterFeatures}
            existingFeatures={plan.features}
            onAddFromMaster={addFeatureFromMaster}
            onAddBlank={addFeatureBlank}
            isLastPlan={isLastPlan}
          />
        </div>
        <div className="space-y-2">
          {plan.features.map((f, i) => (
            <FeatureRow
              key={i}
              feature={f}
              index={i}
              isDragging={draggedFeatureIndex === i}
              onChange={ff => setFeature(i, ff)}
              onRemove={() => removeFeature(i)}
              onDragStart={() => handleFeatureDragStart(i)}
              onDragOver={(e) => handleFeatureDragOver(e, i)}
              onDragEnd={handleFeatureDragEnd}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
