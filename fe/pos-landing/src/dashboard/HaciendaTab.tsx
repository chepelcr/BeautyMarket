import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LangToggle, TextField, TextAreaField, AddButton } from './components';
import { AutoTranslateWrapper } from './components/AutoTranslateWrapper';

interface HaciendaCard {
  icon: string;
  title: string;
  desc: string;
}

export function HaciendaTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const cards = (config.translations[lang]?.hacienda?.cards as HaciendaCard[]) ?? [];

  const updateCards = (newCards: HaciendaCard[]) => {
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          hacienda: {
            ...config.translations[lang]?.hacienda,
            cards: newCards,
          },
        },
      },
    });
  };

  const addCard = () => {
    updateCards([
      ...cards,
      {
        icon: 'ShieldCheck',
        title: 'New Feature',
        desc: 'Feature description',
      },
    ]);
  };

  const updateCard = (index: number, updates: Partial<HaciendaCard>) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], ...updates };
    updateCards(newCards);
  };

  const deleteCard = (index: number) => {
    updateCards(cards.filter((_, i) => i !== index));
    setPendingDelete(null);
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    const newCards = [...cards];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newCards[index], newCards[newIndex]] = [newCards[newIndex], newCards[index]];
    updateCards(newCards);
  };

  const handleAutoTranslate = (translatedData: any) => {
    if (translatedData.cards) {
      setConfig({
        ...config,
        translations: {
          ...config.translations,
          [lang]: {
            ...config.translations[lang],
            hacienda: {
              ...config.translations[lang]?.hacienda,
              ...translatedData,
            },
          },
        },
      });
    }
  };

  const sourceLang = lang === 'en' ? 'es' : 'en';
  const sourceData = config.translations[sourceLang]?.hacienda;
  const targetData = config.translations[lang]?.hacienda;

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

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card, i) => (
            <div key={i} className="border border-border rounded-lg bg-card p-4">
              <div className="space-y-3">
                {/* Icon preview */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-accent text-accent-foreground flex items-center justify-center">
                    <Icon name={card.icon as IconName} size={20} />
                  </div>
                  <div className="text-xs text-muted-foreground">Tarjeta {i + 1}</div>
                </div>

                {/* Fields */}
                <TextField
                  label="Icono"
                  value={card.icon}
                  onChange={val => updateCard(i, { icon: val })}
                  placeholder="Nombre del icono"
                  inputClassName="h-8 text-xs"
                />
                <TextField
                  label="Título"
                  value={card.title}
                  onChange={val => updateCard(i, { title: val })}
                  inputClassName="h-8 text-xs"
                />
                <TextAreaField
                  label="Descripción"
                  value={card.desc}
                  onChange={val => updateCard(i, { desc: val })}
                  rows={3}
                  textareaClassName="text-xs"
                />

                {/* Actions */}
                <div className="flex items-center gap-1 pt-2 border-t border-border">
                  {i > 0 && (
                    <button
                      onClick={() => moveCard(i, 'up')}
                      className="h-7 px-2 rounded border border-border bg-card text-foreground text-xs font-medium hover:bg-muted flex items-center gap-1 flex-1 justify-center"
                    >
                      <Icon name="ArrowUp" size={12} />
                    </button>
                  )}
                  {i < cards.length - 1 && (
                    <button
                      onClick={() => moveCard(i, 'down')}
                      className="h-7 px-2 rounded border border-border bg-card text-foreground text-xs font-medium hover:bg-muted flex items-center gap-1 flex-1 justify-center"
                    >
                      <Icon name="ArrowDown" size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => setPendingDelete(i)}
                    className="h-7 px-2 rounded border border-border bg-card text-destructive text-xs font-medium hover:bg-destructive/10 flex items-center gap-1 flex-1 justify-center"
                  >
                    <Icon name="Trash2" size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AddButton
          onClick={addCard}
          label="Agregar Tarjeta"
          variant="outline"
          className="w-full"
        />

        {/* Confirm modal */}
        {pendingDelete !== null && (
          <ConfirmModal
            title="¿Eliminar tarjeta?"
            description={`Eliminar "${cards[pendingDelete]?.title}" de la sección Hacienda.`}
            confirmLabel="Eliminar"
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => deleteCard(pendingDelete)}
          />
        )}
      </div>
    </AutoTranslateWrapper>
  );
}
