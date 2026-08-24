/**
 * FAQItem Component
 * Single FAQ question/answer editor
 */

import { Icon } from '@/components/ui/Icon';
import { TextField, TextAreaField, ItemActions } from '../components';

interface FaqItem {
  q: string;
  a: string;
}

interface FAQItemProps {
  item: FaqItem;
  index: number;
  total: number;
  onChange: (updates: Partial<FaqItem>) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
}

export function FAQItem({ item, index, total, onChange, onMove, onDelete }: FAQItemProps) {
  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon name="HelpCircle" size={18} />
          </div>
          <TextField
            value={item.q}
            onChange={val => onChange({ q: val })}
            placeholder="Pregunta"
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

      <div className="mt-3 pl-13">
        <TextAreaField
          label="Respuesta"
          value={item.a}
          onChange={val => onChange({ a: val })}
          rows={3}
          placeholder="Respuesta a la pregunta..."
        />
      </div>
    </div>
  );
}
