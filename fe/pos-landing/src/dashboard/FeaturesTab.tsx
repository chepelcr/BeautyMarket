import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LangToggle, AddButton } from './components';
import { AutoTranslateWrapper } from './components/AutoTranslateWrapper';
import { FeatureGroup } from './features';

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

interface FeatureGroup {
  eyebrow: string;
  title: string;
  items: FeatureItem[];
}

export function FeaturesTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [expandedGroup, setExpandedGroup] = useState<number | null>(0);
  const [pendingDeleteGroup, setPendingDeleteGroup] = useState<number | null>(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{ groupIndex: number; itemIndex: number } | null>(null);

  const groups = (config.translations[lang]?.features?.groups as FeatureGroup[]) ?? [];

  const updateGroups = (newGroups: FeatureGroup[]) => {
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          features: {
            ...config.translations[lang]?.features,
            groups: newGroups,
          },
        },
      },
    });
  };

  const handleAddGroup = () => {
    updateGroups([
      ...groups,
      {
        eyebrow: 'New Category',
        title: 'New Group Title',
        items: [],
      },
    ]);
    setExpandedGroup(groups.length);
  };

  const updateGroup = (index: number, updates: Partial<FeatureGroup>) => {
    const newGroups = [...groups];
    newGroups[index] = { ...newGroups[index], ...updates };
    updateGroups(newGroups);
  };

  const handleDeleteGroup = (index: number) => {
    updateGroups(groups.filter((_, i) => i !== index));
    setExpandedGroup(null);
    setPendingDeleteGroup(null);
  };

  const handleMoveGroup = (index: number, direction: 'up' | 'down') => {
    const newGroups = [...groups];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newGroups[index], newGroups[newIndex]] = [newGroups[newIndex], newGroups[index]];
    updateGroups(newGroups);
    setExpandedGroup(newIndex);
  };

  const addItem = (groupIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].items.push({
      icon: 'Package',
      title: 'New Feature',
      desc: 'Feature description',
    });
    updateGroups(newGroups);
  };

  const updateItem = (groupIndex: number, itemIndex: number, updates: Partial<FeatureItem>) => {
    const newGroups = [...groups];
    newGroups[groupIndex].items[itemIndex] = {
      ...newGroups[groupIndex].items[itemIndex],
      ...updates,
    };
    updateGroups(newGroups);
  };

  const deleteItem = (groupIndex: number, itemIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].items = newGroups[groupIndex].items.filter((_, i) => i !== itemIndex);
    updateGroups(newGroups);
    setPendingDeleteItem(null);
  };

  const moveItem = (groupIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const newGroups = [...groups];
    const items = newGroups[groupIndex].items;
    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
    updateGroups(newGroups);
  };

  const handleAutoTranslate = (translatedData: any) => {
    if (translatedData.groups) {
      setConfig({
        ...config,
        translations: {
          ...config.translations,
          [lang]: {
            ...config.translations[lang],
            features: {
              ...config.translations[lang]?.features,
              ...translatedData,
            },
          },
        },
      });
    }
  };

  const sourceLang = lang === 'en' ? 'es' : 'en';
  const sourceData = config.translations[sourceLang]?.features;
  const targetData = config.translations[lang]?.features;

  return (
    <AutoTranslateWrapper
      sourceData={sourceData}
      targetData={targetData}
      sourceLang={sourceLang}
      targetLang={lang}
      onTranslated={handleAutoTranslate}
      enabled={true}
    >
      <div className="space-y-6">
        <LangToggle value={lang} onChange={setLang} />

        <div className="space-y-3">
          {groups.map((group, gi) => (
            <FeatureGroup
              key={gi}
              group={group}
              index={gi}
              total={groups.length}
              isExpanded={expandedGroup === gi}
              onToggle={() => setExpandedGroup(expandedGroup === gi ? null : gi)}
              onChange={updates => updateGroup(gi, updates)}
              onMove={dir => handleMoveGroup(gi, dir)}
              onDelete={() => setPendingDeleteGroup(gi)}
              onAddItem={() => addItem(gi)}
              onUpdateItem={(ii, updates) => updateItem(gi, ii, updates)}
              onMoveItem={(ii, dir) => moveItem(gi, ii, dir)}
              onDeleteItem={ii => setPendingDeleteItem({ groupIndex: gi, itemIndex: ii })}
            />
          ))}
        </div>

        <AddButton
          onClick={handleAddGroup}
          label="Agregar Grupo de Características"
          variant="outline"
        />

        {/* Confirm modals */}
        {pendingDeleteGroup !== null && (
          <ConfirmModal
            title="¿Eliminar grupo de características?"
            description={`Eliminar "${groups[pendingDeleteGroup]?.title}" y todas sus características.`}
            confirmLabel="Eliminar"
            onCancel={() => setPendingDeleteGroup(null)}
            onConfirm={() => handleDeleteGroup(pendingDeleteGroup)}
          />
        )}

        {pendingDeleteItem !== null && (
          <ConfirmModal
            title="¿Eliminar característica?"
            description={`Eliminar "${groups[pendingDeleteItem.groupIndex]?.items[pendingDeleteItem.itemIndex]?.title}" de este grupo.`}
            confirmLabel="Eliminar"
            onCancel={() => setPendingDeleteItem(null)}
            onConfirm={() => deleteItem(pendingDeleteItem.groupIndex, pendingDeleteItem.itemIndex)}
          />
        )}
      </div>
    </AutoTranslateWrapper>
  );
}
