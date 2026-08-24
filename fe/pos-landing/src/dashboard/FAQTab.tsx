import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LangToggle, AddButton } from './components';
import { AutoTranslateWrapper } from './components/AutoTranslateWrapper';
import { FAQItem } from './faq';

interface FaqItem {
  q: string;
  a: string;
}

export function FAQTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const items = (config.translations[lang]?.faq?.items as FaqItem[]) ?? [];

  const updateItems = (newItems: FaqItem[]) => {
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          faq: {
            ...config.translations[lang]?.faq,
            items: newItems,
          },
        },
      },
    });
  };

  const addItem = () => {
    updateItems([
      ...items,
      {
        q: 'New question?',
        a: 'Answer to the question.',
      },
    ]);
  };

  const updateItem = (index: number, updates: Partial<FaqItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    updateItems(newItems);
  };

  const deleteItem = (index: number) => {
    updateItems(items.filter((_, i) => i !== index));
    setPendingDelete(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    updateItems(newItems);
  };

  const handleAutoTranslate = (translatedData: any) => {
    if (translatedData.items) {
      setConfig({
        ...config,
        translations: {
          ...config.translations,
          [lang]: {
            ...config.translations[lang],
            faq: {
              ...config.translations[lang]?.faq,
              ...translatedData,
            },
          },
        },
      });
    }
  };

  const sourceLang = lang === 'en' ? 'es' : 'en';
  const sourceData = config.translations[sourceLang]?.faq;
  const targetData = config.translations[lang]?.faq;

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
          {items.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              index={i}
              total={items.length}
              onChange={updates => updateItem(i, updates)}
              onMove={dir => moveItem(i, dir)}
              onDelete={() => setPendingDelete(i)}
            />
          ))}
        </div>

        <AddButton
          onClick={addItem}
          label="Agregar Pregunta"
          variant="outline"
          className="w-full"
        />

        {/* Confirm modal */}
        {pendingDelete !== null && (
          <ConfirmModal
            title="¿Eliminar pregunta?"
            description={`Eliminar: "${items[pendingDelete]?.q}"`}
            confirmLabel="Eliminar"
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => deleteItem(pendingDelete)}
          />
        )}
      </div>
    </AutoTranslateWrapper>
  );
}
