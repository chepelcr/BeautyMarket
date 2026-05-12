import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LangToggle, TextField, TextAreaField, AddButton } from './components';
import { AutoTranslateWrapper } from './components/AutoTranslateWrapper';

interface Addon {
  icon: string;
  title: string;
  description: string;
}

export function PricingAddonsTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const addons = (config.translations[lang]?.pricing?.addons as Addon[]) ?? [];

  const updateAddons = (newAddons: Addon[]) => {
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          pricing: {
            ...config.translations[lang]?.pricing,
            addons: newAddons,
          },
        },
      },
    });
  };

  const addAddon = () => {
    updateAddons([
      ...addons,
      {
        icon: 'Package',
        title: 'New Addon',
        description: 'Addon description',
      },
    ]);
  };

  const updateAddon = (index: number, updates: Partial<Addon>) => {
    const newAddons = [...addons];
    newAddons[index] = { ...newAddons[index], ...updates };
    updateAddons(newAddons);
  };

  const deleteAddon = (index: number) => {
    updateAddons(addons.filter((_, i) => i !== index));
    setPendingDelete(null);
  };

  const moveAddon = (index: number, direction: 'up' | 'down') => {
    const newAddons = [...addons];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newAddons[index], newAddons[newIndex]] = [newAddons[newIndex], newAddons[index]];
    updateAddons(newAddons);
  };

  const handleAutoTranslate = (translatedData: any) => {
    if (translatedData.addons) {
      setConfig({
        ...config,
        translations: {
          ...config.translations,
          [lang]: {
            ...config.translations[lang],
            pricing: {
              ...config.translations[lang]?.pricing,
              addons: translatedData.addons,
            },
          },
        },
      });
    }
  };

  const sourceLang = lang === 'en' ? 'es' : 'en';
  const sourceData = { addons: config.translations[sourceLang]?.pricing?.addons };
  const targetData = { addons: config.translations[lang]?.pricing?.addons };

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

        {/* Info */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            <Icon name="AlertCircle" size={14} className="inline mr-1" />
            Estas tarjetas de addon aparecen al final de la sección de precios.
          </p>
        </div>

        {/* Addons */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {addons.map((addon, i) => (
            <div key={i} className="border border-border rounded-lg bg-card p-4">
              <div className="space-y-3">
                {/* Icon and title row */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                    <Icon name={addon.icon as IconName} size={18} />
                  </div>
                  <TextField
                    value={addon.title}
                    onChange={val => updateAddon(i, { title: val })}
                    placeholder="Título del addon"
                    inputClassName="h-8 text-xs font-semibold"
                  />
                </div>

                {/* Fields below */}
                <TextField
                  label="Icono"
                  value={addon.icon}
                  onChange={val => updateAddon(i, { icon: val })}
                  placeholder="Nombre del icono"
                  inputClassName="h-8 text-xs"
                />
                <TextAreaField
                  label="Descripción"
                  value={addon.description}
                  onChange={val => updateAddon(i, { description: val })}
                  rows={3}
                  textareaClassName="text-xs"
                />

                {/* Actions */}
                <div className="flex items-center gap-1 pt-2 border-t border-border">
                  {i > 0 && (
                    <button
                      onClick={() => moveAddon(i, 'up')}
                      className="h-7 px-2 rounded border border-border text-xs font-medium hover:bg-muted flex items-center gap-1 flex-1 justify-center"
                    >
                      <Icon name="ArrowUp" size={12} />
                    </button>
                  )}
                  {i < addons.length - 1 && (
                    <button
                      onClick={() => moveAddon(i, 'down')}
                      className="h-7 px-2 rounded border border-border text-xs font-medium hover:bg-muted flex items-center gap-1 flex-1 justify-center"
                    >
                      <Icon name="ArrowDown" size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => setPendingDelete(i)}
                    className="h-7 px-2 rounded border border-border text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 flex-1 justify-center"
                  >
                    <Icon name="Trash2" size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AddButton
          onClick={addAddon}
          label="Agregar Addon"
          variant="outline"
          className="w-full"
        />

        {/* Confirm modal */}
        {pendingDelete !== null && (
          <ConfirmModal
            title="¿Eliminar addon?"
            description={`Eliminar "${addons[pendingDelete]?.title}" de la sección de precios.`}
            confirmLabel="Eliminar"
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => deleteAddon(pendingDelete)}
          />
        )}
      </div>
    </AutoTranslateWrapper>
  );
}
