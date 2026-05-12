/**
 * ColorPicker Component
 * Color selector for feature colors
 */

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { COLORS, type FeatureColor } from './types';

interface ColorPickerProps {
  value: FeatureColor;
  onChange: (c: FeatureColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
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
