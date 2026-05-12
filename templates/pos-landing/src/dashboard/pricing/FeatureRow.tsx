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
      className={cn(
        "flex items-center gap-2 transition-opacity",
        isDragging && "opacity-50"
      )}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <button
        className="w-5 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0"
        title="Arrastrar para reordenar"
      >
        <Icon name="GripVertical" size={14} />
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
        className="flex-1 h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
        placeholder="Etiqueta de característica"
      />
      <ColorPicker
        value={feature.color ?? (feature.enabled ? 'success' : 'muted')}
        onChange={c => onChange({ ...feature, color: c })}
      />
      <button
        onClick={onRemove}
        className="w-7 h-7 rounded hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0"
        title="Eliminar del plan"
      >
        <Icon name="X" size={13} />
      </button>
    </div>
  );
}
