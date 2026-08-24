/**
 * FeatureItem Component
 * Single feature item within a group
 */

import { Icon, type IconName } from '@/components/ui/Icon';
import { TextField, TextAreaField, ItemActions } from '../components';

interface FeatureItemData {
  icon: string;
  title: string;
  desc: string;
}

interface FeatureItemProps {
  item: FeatureItemData;
  index: number;
  total: number;
  onChange: (updates: Partial<FeatureItemData>) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
}

export function FeatureItem({ item, index, total, onChange, onMove, onDelete }: FeatureItemProps) {
  return (
    <div className="border border-border rounded-md p-3 bg-background">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon name={item.icon as IconName} size={18} />
          </div>
          <div className="flex-1">
            <TextField
              value={item.title}
              onChange={val => onChange({ title: val })}
              placeholder="Título de característica"
              inputClassName="font-semibold"
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

      <div className="mt-3 space-y-2 pl-13">
        <TextField
          label="Icono"
          value={item.icon}
          onChange={val => onChange({ icon: val })}
          placeholder="Nombre del icono"
          inputClassName="text-xs"
        />
        <TextAreaField
          label="Descripción"
          value={item.desc}
          onChange={val => onChange({ desc: val })}
          rows={2}
        />
      </div>
    </div>
  );
}
