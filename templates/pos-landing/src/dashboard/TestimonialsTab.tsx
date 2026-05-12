import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LangToggle, AddButton } from './components';
import { AutoTranslateWrapper } from './components/AutoTranslateWrapper';
import { TestimonialCard } from './testimonials';

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

export function TestimonialsTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const items = (config.translations[lang]?.testimonials?.items as TestimonialItem[]) ?? [];

  const updateItems = (newItems: TestimonialItem[]) => {
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          testimonials: {
            ...config.translations[lang]?.testimonials,
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
        quote: 'New testimonial quote',
        author: 'Author Name',
        role: 'Role / Company',
      },
    ]);
  };

  const updateItem = (index: number, updates: Partial<TestimonialItem>) => {
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
            testimonials: {
              ...config.translations[lang]?.testimonials,
              ...translatedData,
            },
          },
        },
      });
    }
  };

  const sourceLang = lang === 'en' ? 'es' : 'en';
  const sourceData = config.translations[sourceLang]?.testimonials;
  const targetData = config.translations[lang]?.testimonials;

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
            <TestimonialCard
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
          label="Agregar Testimonio"
          variant="outline"
          className="w-full"
        />

        {pendingDelete !== null && (
          <ConfirmModal
            title="¿Eliminar testimonio?"
            description={`Eliminar testimonio de "${items[pendingDelete]?.author}".`}
            confirmLabel="Eliminar"
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => deleteItem(pendingDelete)}
          />
        )}
      </div>
    </AutoTranslateWrapper>
  );
}
