/**
 * MasterFeaturesPanel Component
 * Master features catalog management
 */

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { FeatureDef } from './types';

interface MasterFeaturesPanelProps {
  features: FeatureDef[];
  onChange: (features: FeatureDef[]) => void;
}

export function MasterFeaturesPanel({ features, onChange }: MasterFeaturesPanelProps) {
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  const handleDragStart = (i: number) => {
    setDraggedIndex(i);
  };

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === i) return;
    
    const newFeatures = [...features];
    const draggedItem = newFeatures[draggedIndex];
    newFeatures.splice(draggedIndex, 1);
    newFeatures.splice(i, 0, draggedItem);
    
    onChange(newFeatures);
    setDraggedIndex(i);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="card p-5 space-y-3">
      <div>
        <h3 className="font-display font-bold text-base">Características Maestras</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Catálogo de conceptos de características. Úsalas como sugerencias al agregar características a los planes 
          (cada plan tiene sus propias etiquetas y toggles).
        </p>
      </div>

      <div className="space-y-1.5">
        {features.map((f, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-2 items-center transition-opacity",
              draggedIndex === i && "opacity-50"
            )}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
          >
            <button
              className="w-6 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0"
              title="Arrastrar para reordenar"
            >
              <Icon name="GripVertical" size={14} />
            </button>
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
              placeholder="Etiqueta por defecto"
            />
            <button
              onClick={() => removeFeature(i)}
              className="w-8 h-8 rounded hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center"
              title="Eliminar de la lista maestra"
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
          placeholder="nuevo-id"
          className="w-32 h-8 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:border-primary"
        />
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Etiqueta por defecto"
          className="flex-1 h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
          onKeyDown={e => e.key === 'Enter' && addFeature()}
        />
        <button
          onClick={addFeature}
          className="h-8 px-3 rounded bg-muted text-foreground text-xs font-semibold hover:bg-muted/70 flex items-center gap-1"
        >
          <Icon name="Plus" size={12} />Agregar
        </button>
      </div>
    </div>
  );
}
