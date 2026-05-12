/**
 * AddonCard Component
 * Single addon editor for Pricing Addons section
 */

import { Icon } from '@/components/ui/Icon';
import { TextField, TextAreaField, ItemActions } from '../components';

interface AddonItem {
  name: string;
  price: string;
  desc: string;
}

interface AddonCardProps {
  item: AddonItem;
  index: number;
  total: number;
  onChange: (updates: Partial<AddonItem>) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
}

export function AddonCard({ item, index, total, onChange, onMove, onDelete }: AddonCardProps) {
  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon name="Package" size={18} />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <TextField
              value={item.name}
              onChange={val => onChange({ name: val })}
              placeholder="Nombre del addon"
              inputClassName="font-semibold"
            />
            <TextField
              value={item.price}
              onChange={val => onChange({ price: val })}
              placeholder="Precio"
              inputClassName="font-mono"
            />
          </div>
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
          label="Descripción"
          value={item.desc}
          onChange={val => onChange({ desc: val })}
          rows={2}
          placeholder="Descripción del addon..."
        />
      </div>
    </div>
  );
}
