/**
 * MasterFeaturesPanel Component
 * Master features catalog management
 */

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { AddButton } from '../components/AddButton';
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
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Características Maestras ({features.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Catálogo de conceptos. Úsalas como sugerencias al agregar características a los planes.
          </p>
        </div>
      </div>

      {/* Add new feature form */}
      <div className="flex gap-2 p-3 rounded-md border border-dashed border-border bg-muted/30">
        <input
          type="text"
          value={newId}
          onChange={e => setNewId(e.target.value)}
          placeholder="nuevo-id"
          className="w-32 h-9 rounded border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:border-primary"
        />
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Etiqueta por defecto"
          className="flex-1 h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
          onKeyDown={e => e.key === 'Enter' && addFeature()}
        />
        <button
          onClick={addFeature}
          disabled={!newId.trim() || !newLabel.trim()}
          className="h-9 px-4 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="Plus" size={14} />Agregar
        </button>
      </div>

      {/* Features list */}
      <div className="space-y-2">
        {features.map((f, i) => (
          <div 
            key={i} 
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex gap-2 items-center p-3 rounded-md border transition",
              draggedIndex === i 
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
              type="text"
              value={f.id}
              onChange={e => updateFeature(i, 'id', e.target.value)}
              className="w-32 h-9 rounded border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:border-primary"
              placeholder="id"
            />
            <input
              type="text"
              value={f.label}
              onChange={e => updateFeature(i, 'label', e.target.value)}
              className="flex-1 h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Etiqueta por defecto"
            />
            <button
              onClick={() => removeFeature(i)}
              className="w-9 h-9 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center"
              title="Eliminar"
            >
              <Icon name="Trash" size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
