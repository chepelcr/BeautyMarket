/**
 * BenefitCard Component
 * Single benefit editor for Hacienda section
 */

import { Icon } from '@/components/ui/Icon';
import { TextField, TextAreaField, ItemActions } from '../components';

interface BenefitItem {
  icon: string;
  title: string;
  desc: string;
}

interface BenefitCardProps {
  item: BenefitItem;
  index: number;
  total: number;
  onChange: (updates: Partial<BenefitItem>) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
}

export function BenefitCard({ item, index, total, onChange, onMove, onDelete }: BenefitCardProps) {
  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon name={item.icon as any} size={18} />
          </div>
          <TextField
            value={item.title}
            onChange={val => onChange({ title: val })}
            placeholder="Título del beneficio"
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

      <div className="mt-3 space-y-3 pl-13">
        <TextField
          label="Icono"
          value={item.icon}
          onChange={val => onChange({ icon: val })}
          placeholder="Nombre del icono"
        />
        <TextAreaField
          label="Descripción"
          value={item.desc}
          onChange={val => onChange({ desc: val })}
          rows={2}
          placeholder="Descripción del beneficio..."
        />
      </div>
    </div>
  );
}
