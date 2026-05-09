import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Icon } from '@/components/ui/Icon';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { fmtCRC, fmtUSD } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Plan, PlanFeature, FeatureColor, FeatureDef } from '@/types';

const COLORS: Array<{ value: FeatureColor; bg: string; label: string }> = [
  { value: 'success',     bg: '#16a34a', label: 'Success' },
  { value: 'primary',     bg: '#e0640a', label: 'Primary' },
  { value: 'warning',     bg: '#ea9c1a', label: 'Warning' },
  { value: 'destructive', bg: '#d63d3d', label: 'Destructive' },
  { value: 'muted',       bg: '#888888', label: 'Muted' },
];

function genId(prefix = 'plan') {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
}

const EMPTY_PLAN = (): Plan => ({
  id:               genId('plan'),
  name:             'New Plan',
  tagline:          'Plan description here',
  priceCRC:         0,
  priceMin:         0,
  priceMax:         500000,
  priceSuffix:      '/ mes',
  showPriceSlider:  true,
  ctaLabel:         'Empezar',
  ctaHref:          '#',
  badge:            '',
  highlighted:      false,
  subline:          '',
  showAmortization: false,
  showMoneyBack:    false,
  features:         [],
});

export function PricingTab() {
  const { config, setConfig } = useConfig();
  const pricing = config.pricing;

  const setPricing = (next: Partial<typeof pricing>) =>
    setConfig({ ...config, pricing: { ...pricing, ...next } });

  const setPlan = (i: number, plan: Plan) => {
    const plans = [...pricing.plans];
    plans[i] = plan;
    setPricing({ plans });
  };

  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const addPlan = () => setPricing({ plans: [...pricing.plans, EMPTY_PLAN()] });
  const removePlan = (i: number) => {
    setPricing({ plans: pricing.plans.filter((_, idx) => idx !== i) });
    setPendingDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Currency + USD rate ──────────────────────────────────────── */}
      <div className="card p-5 space-y-4">
        <h3 className="font-display font-bold text-base">Currency & Rate</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Currency</label>
            <div className="grid grid-cols-2 gap-2">
              {(['CRC', 'USD'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setPricing({ currency: c })}
                  className={cn('h-10 rounded-md border-2 text-sm font-semibold transition',
                    pricing.currency === c ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')}
                >
                  {c === 'CRC' ? '₡ Colones' : '$ USD'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">USD Rate (₡ per $1)</label>
            <input
              type="number"
              value={pricing.usdRateCRC}
              onChange={e => setPricing({ usdRateCRC: Number(e.target.value) })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="Free Docs / Month" value={pricing.freeDocs}           onChange={v => setPricing({ freeDocs: v })} />
          <NumberField label="Amortization Months" value={pricing.amortizationMonths} onChange={v => setPricing({ amortizationMonths: v })} />
          <NumberField label="Money-back Days"     value={pricing.moneyBackDays}     onChange={v => setPricing({ moneyBackDays: v })} />
        </div>
      </div>

      {/* ── Master features panel ────────────────────────────────────── */}
      <FeaturesPanel
        features={pricing.features}
        onChange={features => setPricing({ features })}
      />

      {/* ── Plan cards ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base">Plans ({pricing.plans.length})</h3>
          <button
            onClick={addPlan}
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90"
          >
            <Icon name="Plus" size={14} />Add plan
          </button>
        </div>

        {pricing.plans.map((plan, i) => (
          <PlanCardEditor
            key={plan.id}
            plan={plan}
            currency={pricing.currency}
            usdRate={pricing.usdRateCRC}
            masterFeatures={pricing.features}
            onChange={p => setPlan(i, p)}
            onDelete={() => setPendingDelete(i)}
          />
        ))}
      </div>

      {pendingDelete !== null && (
        <ConfirmModal
          title={`Delete "${pricing.plans[pendingDelete].name}"?`}
          description="This permanently removes the plan from config.json. Other plans are not affected."
          confirmLabel="Delete plan"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => removePlan(pendingDelete)}
        />
      )}
    </div>
  );
}

// ── Number field ────────────────────────────────────────────────────

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:border-primary"
      />
    </div>
  );
}

// ── Master features panel ───────────────────────────────────────────

function FeaturesPanel({ features, onChange }: { features: FeatureDef[]; onChange: (f: FeatureDef[]) => void }) {
  const [newId, setNewId]       = useState('');
  const [newLabel, setNewLabel] = useState('');

  const addFeature = () => {
    if (!newId.trim() || !newLabel.trim()) return;
    if (features.some(f => f.id === newId)) return;
    onChange([...features, { id: newId.trim(), label: newLabel.trim() }]);
    setNewId('');
    setNewLabel('');
  };

  const updateFeature = (i: number, key: keyof FeatureDef, val: string) => {
    const next = [...features];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };

  const removeFeature = (i: number) => onChange(features.filter((_, idx) => idx !== i));

  return (
    <div className="card p-5 space-y-3">
      <div>
        <h3 className="font-display font-bold text-base">Master Features</h3>
        <p className="text-xs text-muted-foreground mt-1">Catalog of feature concepts. Use as suggestions when adding features to plans (each plan still has its own labels and toggles).</p>
      </div>

      <div className="space-y-1.5">
        {features.map((f, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={f.id}
              onChange={e => updateFeature(i, 'id', e.target.value)}
              className="w-32 h-8 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:border-primary"
              placeholder="id"
            />
            <input
              type="text"
              value={f.label}
              onChange={e => updateFeature(i, 'label', e.target.value)}
              className="flex-1 h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
              placeholder="Default label"
            />
            <button
              onClick={() => removeFeature(i)}
              className="w-8 h-8 rounded hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center"
              title="Remove from master list"
            >
              <Icon name="Trash" size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <input
          type="text"
          value={newId}
          onChange={e => setNewId(e.target.value)}
          placeholder="new-id"
          className="w-32 h-8 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:border-primary"
        />
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Default label"
          className="flex-1 h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
          onKeyDown={e => e.key === 'Enter' && addFeature()}
        />
        <button
          onClick={addFeature}
          className="h-8 px-3 rounded bg-muted text-foreground text-xs font-semibold hover:bg-muted/70 flex items-center gap-1"
        >
          <Icon name="Plus" size={12} />Add
        </button>
      </div>
    </div>
  );
}

// ── Plan card editor ────────────────────────────────────────────────

interface PlanCardEditorProps {
  plan:           Plan;
  currency:       'CRC' | 'USD';
  usdRate:        number;
  masterFeatures: FeatureDef[];
  onChange:       (p: Plan) => void;
  onDelete:       () => void;
}

function PlanCardEditor({ plan, currency, usdRate, masterFeatures, onChange, onDelete }: PlanCardEditorProps) {
  const set = <K extends keyof Plan>(key: K, val: Plan[K]) => onChange({ ...plan, [key]: val });

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
    features: [...plan.features, { label: def.label, enabled: true, color: 'success' }],
  });

  const removeFeature = (i: number) => onChange({
    ...plan,
    features: plan.features.filter((_, idx) => idx !== i),
  });

  return (
    <div className={cn('card p-5 space-y-4', plan.highlighted && 'border-primary border-2')}>
      {/* Header — name + delete */}
      <div className="flex items-start gap-3">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Name</label>
            <input
              type="text"
              value={plan.name}
              onChange={e => set('name', e.target.value)}
              className="w-full h-9 rounded border border-border bg-background px-2 text-sm font-semibold focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Badge</label>
            <input
              type="text"
              value={plan.badge ?? ''}
              onChange={e => set('badge', e.target.value)}
              placeholder="e.g., Recommended"
              className="w-full h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <button
          onClick={onDelete}
          className="w-9 h-9 mt-5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center"
          title="Delete plan"
        >
          <Icon name="Trash" size={15} />
        </button>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tagline</label>
        <input
          type="text"
          value={plan.tagline}
          onChange={e => set('tagline', e.target.value)}
          className="w-full h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Price slider */}
      <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</label>
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={plan.showPriceSlider}
              onChange={e => set('showPriceSlider', e.target.checked)}
              className="accent-primary"
            />
            Show price slider
          </label>
        </div>

        {plan.showPriceSlider && (
          <>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={plan.priceMin}
                max={plan.priceMax}
                step={1000}
                value={plan.priceCRC}
                onChange={e => set('priceCRC', Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-bold font-mono w-24 text-right">{fmt(plan.priceCRC)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <NumberField label="Price (₡)"  value={plan.priceCRC} onChange={v => set('priceCRC', v)} />
              <NumberField label="Min (₡)"    value={plan.priceMin} onChange={v => set('priceMin', v)} />
              <NumberField label="Max (₡)"    value={plan.priceMax} onChange={v => set('priceMax', v)} />
            </div>
          </>
        )}

        <div>
          <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Price suffix (e.g., "/ mes", "una vez")</label>
          <input
            type="text"
            value={plan.priceSuffix}
            onChange={e => set('priceSuffix', e.target.value)}
            className="w-full h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* CTA + flags */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">CTA Label</label>
          <input
            type="text"
            value={plan.ctaLabel}
            onChange={e => set('ctaLabel', e.target.value)}
            className="w-full h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">CTA Href</label>
          <input
            type="text"
            value={plan.ctaHref}
            onChange={e => set('ctaHref', e.target.value)}
            className="w-full h-9 rounded border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <ToggleField label="Highlighted (border + glow)" checked={plan.highlighted}      onChange={v => set('highlighted', v)} />
        <ToggleField label="Show amortization line"      checked={plan.showAmortization} onChange={v => set('showAmortization', v)} />
        <ToggleField label="Show money-back guarantee"   checked={plan.showMoneyBack}    onChange={v => set('showMoneyBack', v)} />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Subline (small text below price, when no amortization)</label>
        <input
          type="text"
          value={plan.subline ?? ''}
          onChange={e => set('subline', e.target.value)}
          className="w-full h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
        />
      </div>

      {/* Features list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features ({plan.features.length})</label>
          <FeatureAddDropdown
            masterFeatures={masterFeatures}
            existingLabels={plan.features.map(f => f.label)}
            onAddFromMaster={addFeatureFromMaster}
            onAddBlank={addFeatureBlank}
          />
        </div>
        <div className="space-y-1.5">
          {plan.features.map((f, i) => (
            <FeatureRowEditor
              key={i}
              feature={f}
              onChange={ff => setFeature(i, ff)}
              onRemove={() => removeFeature(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

// ── Feature row editor ─────────────────────────────────────────────

function FeatureRowEditor({ feature, onChange, onRemove }: { feature: PlanFeature; onChange: (f: PlanFeature) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={feature.enabled}
        onChange={e => onChange({ ...feature, enabled: e.target.checked })}
        className="accent-primary w-4 h-4 shrink-0"
        title="Enabled (✓ check) / Disabled (✗ strikethrough)"
      />
      <input
        type="text"
        value={feature.label}
        onChange={e => onChange({ ...feature, label: e.target.value })}
        className="flex-1 h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
        placeholder="Feature label"
      />
      <ColorPicker
        value={feature.color ?? (feature.enabled ? 'success' : 'muted')}
        onChange={c => onChange({ ...feature, color: c })}
      />
      <button
        onClick={onRemove}
        className="w-7 h-7 rounded hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0"
        title="Remove from plan"
      >
        <Icon name="X" size={13} />
      </button>
    </div>
  );
}

// ── Color picker ───────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: FeatureColor; onChange: (c: FeatureColor) => void }) {
  const [open, setOpen] = useState(false);
  const current = COLORS.find(c => c.value === value) ?? COLORS[0];

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted"
        title={`Color: ${current.label}`}
      >
        <span className="w-4 h-4 rounded-full border border-border/50" style={{ background: current.bg }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-md shadow-lg p-1 flex gap-1">
            {COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => { onChange(c.value); setOpen(false); }}
                className={cn(
                  'w-7 h-7 rounded flex items-center justify-center hover:bg-muted',
                  value === c.value && 'ring-2 ring-primary',
                )}
                title={c.label}
              >
                <span className="w-4 h-4 rounded-full border border-border/50" style={{ background: c.bg }} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── "Add feature" dropdown — pick from master or add blank ─────────

function FeatureAddDropdown({
  masterFeatures,
  existingLabels,
  onAddFromMaster,
  onAddBlank,
}: {
  masterFeatures:  FeatureDef[];
  existingLabels:  string[];
  onAddFromMaster: (def: FeatureDef) => void;
  onAddBlank:      () => void;
}) {
  const [open, setOpen] = useState(false);
  const available = masterFeatures.filter(f => !existingLabels.includes(f.label));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="h-8 px-3 rounded-md bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-muted/70"
      >
        <Icon name="Plus" size={12} />Add feature
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-md shadow-lg w-64 max-h-72 overflow-auto scroll-area">
            <div className="p-1">
              <button
                onClick={() => { onAddBlank(); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-muted rounded font-semibold flex items-center gap-2"
              >
                <Icon name="Pencil" size={12} />Custom (blank)
              </button>
            </div>
            {available.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-muted-foreground border-t border-border">From master</div>
                <div className="p-1">
                  {available.map(def => (
                    <button
                      key={def.id}
                      onClick={() => { onAddFromMaster(def); setOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-muted rounded"
                    >
                      <div className="font-mono text-muted-foreground text-[10px]">{def.id}</div>
                      <div>{def.label}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
