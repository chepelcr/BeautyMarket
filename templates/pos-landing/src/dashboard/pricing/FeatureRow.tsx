/**
 * FeatureRow Component
 * Single feature editor with drag, toggle, label, color, and delete
 */

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { ColorPicker } from './ColorPicker';
import type { PlanFeature } from './types';

interface FeatureRowProps {
  feature: PlanFeature;
  index: number;
  isDragging: boolean;
  onChange: (f: PlanFeature) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function FeatureRow({ 
  feature, 
  index, 
  isDragging, 
  onChange, 
  onRemove, 
  onDragStart, 
  onDragOver, 
  onDragEnd 
}: FeatureRowProps) {
  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border transition",
        isDragging 
          ? "border-primary bg-primary/5 opacity-50" 
          : "border-border bg-background"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        title="Arrastrar para reordenar"
      >
        <Icon name="Menu" size={16} />
      </button>
      <input
        type="checkbox"
        checked={feature.enabled}
        onChange={e => onChange({ ...feature, enabled: e.target.checked })}
        className="accent-primary w-4 h-4 shrink-0"
        title="Habilitado (✓ check) / Deshabilitado (✗ tachado)"
      />
      <input
        type="text"
        value={feature.label}
        onChange={e => onChange({ ...feature, label: e.target.value })}
        className="flex-1 h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
        placeholder="Etiqueta de característica"
      />
      <ColorPicker
        value={feature.color ?? (feature.enabled ? 'success' : 'muted')}
        onChange={c => onChange({ ...feature, color: c })}
      />
      <button
        onClick={onRemove}
        className="w-9 h-9 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0"
        title="Eliminar del plan"
      >
        <Icon name="Trash" size={15} />
      </button>
    </div>
  );
}
