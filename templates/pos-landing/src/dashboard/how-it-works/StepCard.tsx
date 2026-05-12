/**
 * StepCard Component
 * Single step editor for How It Works section
 */

import { Icon } from '@/components/ui/Icon';
import { TextField, TextAreaField, AddButton } from '../components';

interface StepItem {
  title: string;
  desc: string;
}

interface StepCardProps {
  item: StepItem;
  index: number;
  total: number;
  onChange: (updates: Partial<StepItem>) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
}

export function StepCard({ item, index, total, onChange, onMove, onDelete }: StepCardProps) {
  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-display font-bold">
          {index + 1}
        </div>

        <div className="flex-1 space-y-3">
          <TextField
            label="Título"
            value={item.title}
            onChange={val => onChange({ title: val })}
            placeholder="Título del paso"
            inputClassName="font-semibold"
          />
          <TextAreaField
            label="Descripción"
            value={item.desc}
            onChange={val => onChange({ desc: val })}
            rows={2}
            placeholder="Descripción del paso..."
          />
        </div>

        <div className="flex flex-col gap-1">
          {index > 0 && (
            <button
              onClick={() => onMove('up')}
              className="p-1.5 hover:bg-muted rounded"
              title="Mover arriba"
            >
              <Icon name="ArrowUp" size={14} />
            </button>
          )}
          {index < total - 1 && (
            <button
              onClick={() => onMove('down')}
              className="p-1.5 hover:bg-muted rounded"
              title="Mover abajo"
            >
              <Icon name="ArrowDown" size={14} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-destructive/10 text-destructive rounded"
            title="Eliminar"
          >
            <Icon name="Trash2" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
