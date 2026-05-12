/**
 * TestimonialCard Component
 * Single testimonial editor
 */

import { Icon } from '@/components/ui/Icon';
import { TextField, TextAreaField, ItemActions } from '../components';

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

interface TestimonialCardProps {
  item: TestimonialItem;
  index: number;
  total: number;
  onChange: (updates: Partial<TestimonialItem>) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
}

export function TestimonialCard({ item, index, total, onChange, onMove, onDelete }: TestimonialCardProps) {
  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex items-start gap-4">
        {/* Icon and author */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon name="Quote" size={18} />
          </div>
          <TextField
            value={item.author}
            onChange={val => onChange({ author: val })}
            placeholder="Nombre del autor"
            inputClassName="font-semibold"
          />
        </div>

        <ItemActions
          index={index}
          total={total}
          onMove={onMove}
          onDelete={onDelete}
        />
      </div>

      {/* Fields below */}
      <div className="mt-3 space-y-3 pl-13">
        <TextAreaField
          label="Cita"
          value={item.quote}
          onChange={val => onChange({ quote: val })}
          rows={3}
          placeholder="Cita del testimonio..."
        />
        <TextField
          label="Rol / Empresa"
          value={item.role}
          onChange={val => onChange({ role: val })}
          placeholder="Rol o empresa"
        />
      </div>
    </div>
  );
}
