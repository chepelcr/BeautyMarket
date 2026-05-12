/**
 * FeatureAddDropdown Component
 * Dropdown to add features from master list or create blank
 */

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { FeatureDef, PlanFeature } from './types';

interface FeatureAddDropdownProps {
  masterFeatures: FeatureDef[];
  existingFeatures: PlanFeature[];
  onAddFromMaster: (def: FeatureDef) => void;
  onAddBlank: () => void;
  isLastPlan?: boolean;
}

export function FeatureAddDropdown({
  masterFeatures,
  existingFeatures,
  onAddFromMaster,
  onAddBlank,
  isLastPlan = false,
}: FeatureAddDropdownProps) {
  const [open, setOpen] = useState(false);
  // Filter by ID if the feature has one, otherwise it's a custom feature
  const existingIds = existingFeatures.filter(f => f.id).map(f => f.id);
  const available = masterFeatures.filter(f => !existingIds.includes(f.id));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="h-8 px-3 rounded-md bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-muted/70"
      >
        <Icon name="Plus" size={12} />Agregar característica
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className={cn(
            "absolute right-0 mt-1 z-50 bg-card border border-border rounded-md shadow-lg w-64 max-h-72 overflow-auto scroll-area",
            isLastPlan ? "bottom-full mb-1" : "top-full"
          )}>
            <div className="p-1">
              <button
                onClick={() => { onAddBlank(); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-muted rounded font-semibold flex items-center gap-2"
              >
                <Icon name="Pencil" size={12} />Personalizada (en blanco)
              </button>
            </div>
            {available.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-muted-foreground border-t border-border">
                  Desde maestras
                </div>
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
