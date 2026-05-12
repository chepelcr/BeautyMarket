/**
 * FeatureGroup Component
 * Collapsible group of features
 */

import { Icon } from '@/components/ui/Icon';
import { TextField, ItemActions, AddButton } from '../components';
import { FeatureItem } from './FeatureItem';

interface FeatureItemData {
  icon: string;
  title: string;
  desc: string;
}

interface FeatureGroupData {
  eyebrow: string;
  title: string;
  items: FeatureItemData[];
}

interface FeatureGroupProps {
  group: FeatureGroupData;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (updates: Partial<FeatureGroupData>) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
  onAddItem: () => void;
  onUpdateItem: (itemIndex: number, updates: Partial<FeatureItemData>) => void;
  onMoveItem: (itemIndex: number, direction: 'up' | 'down') => void;
  onDeleteItem: (itemIndex: number) => void;
}

export function FeatureGroup({
  group,
  index,
  total,
  isExpanded,
  onToggle,
  onChange,
  onMove,
  onDelete,
  onAddItem,
  onUpdateItem,
  onMoveItem,
  onDeleteItem,
}: FeatureGroupProps) {
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Group header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition"
      >
        <div className="flex items-center gap-3">
          <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={16} />
          <div className="text-left">
            <div className="text-xs text-muted-foreground font-medium">{group.eyebrow}</div>
            <div className="font-display font-bold">{group.title}</div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
            {group.items.length} elementos
          </span>
        </div>
        <ItemActions
          index={index}
          total={total}
          onMove={onMove}
          onDelete={onDelete}
        />
      </button>

      {/* Group content */}
      {isExpanded && (
        <div className="p-4 border-t border-border space-y-4">
          {/* Group fields */}
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Etiqueta"
              value={group.eyebrow}
              onChange={val => onChange({ eyebrow: val })}
            />
            <TextField
              label="Título"
              value={group.title}
              onChange={val => onChange({ title: val })}
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Tarjetas de Características</label>
              <AddButton
                onClick={onAddItem}
                label="Agregar Característica"
                variant="primary"
                size="sm"
              />
            </div>

            <div className="space-y-2">
              {group.items.map((item, ii) => (
                <FeatureItem
                  key={ii}
                  item={item}
                  index={ii}
                  total={group.items.length}
                  onChange={updates => onUpdateItem(ii, updates)}
                  onMove={dir => onMoveItem(ii, dir)}
                  onDelete={() => onDeleteItem(ii)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
