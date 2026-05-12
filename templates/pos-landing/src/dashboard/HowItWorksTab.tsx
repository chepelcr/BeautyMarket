import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LangToggle, TextField, TextAreaField, AddButton } from './components';
import { AutoTranslateWrapper } from './components/AutoTranslateWrapper';

interface Step {
  icon: string;
  title: string;
  desc: string;
}

export function HowItWorksTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const steps = (config.translations[lang]?.howItWorks?.steps as Step[]) ?? [];

  const updateSteps = (newSteps: Step[]) => {
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          howItWorks: {
            ...config.translations[lang]?.howItWorks,
            steps: newSteps,
          },
        },
      },
    });
  };

  const addStep = () => {
    updateSteps([
      ...steps,
      {
        icon: 'Circle',
        title: 'New Step',
        desc: 'Step description',
      },
    ]);
  };

  const updateStep = (index: number, updates: Partial<Step>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    updateSteps(newSteps);
  };

  const deleteStep = (index: number) => {
    updateSteps(steps.filter((_, i) => i !== index));
    setPendingDelete(null);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    updateSteps(newSteps);
  };

  const handleAutoTranslate = (translatedData: any) => {
    if (translatedData.steps) {
      setConfig({
        ...config,
        translations: {
          ...config.translations,
          [lang]: {
            ...config.translations[lang],
            howItWorks: {
              ...config.translations[lang]?.howItWorks,
              ...translatedData,
            },
          },
        },
      });
    }
  };

  const sourceLang = lang === 'en' ? 'es' : 'en';
  const sourceData = config.translations[sourceLang]?.howItWorks;
  const targetData = config.translations[lang]?.howItWorks;

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

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {steps.map((step, i) => (
            <div key={i} className="border border-border rounded-lg bg-card p-4 relative">
              {/* Step number badge */}
              <div className="absolute top-3 right-3 font-display font-extrabold text-2xl text-primary/15 leading-none">
                0{i + 1}
              </div>

              <div className="space-y-3">
                {/* Icon preview */}
                <div className="w-11 h-11 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                  <Icon name={step.icon as IconName} size={20} />
                </div>

                {/* Fields */}
                <TextField
                  label="Icono"
                  value={step.icon}
                  onChange={val => updateStep(i, { icon: val })}
                  placeholder="Nombre del icono"
                  inputClassName="h-8 text-xs"
                />
                <TextField
                  label="Título"
                  value={step.title}
                  onChange={val => updateStep(i, { title: val })}
                  placeholder="Título del paso"
                  inputClassName="h-8 text-xs font-semibold"
                />
                <TextAreaField
                  label="Descripción"
                  value={step.desc}
                  onChange={val => updateStep(i, { desc: val })}
                  rows={3}
                  textareaClassName="text-xs"
                />

                {/* Actions */}
                <div className="flex items-center gap-1 pt-2 border-t border-border">
                  {i > 0 && (
                    <button
                      onClick={() => moveStep(i, 'up')}
                      className="h-7 px-2 rounded border border-border bg-card text-foreground text-xs font-medium hover:bg-muted flex items-center gap-1 flex-1 justify-center"
                    >
                      <Icon name="ArrowUp" size={12} />
                    </button>
                  )}
                  {i < steps.length - 1 && (
                    <button
                      onClick={() => moveStep(i, 'down')}
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
          onClick={addStep}
          label="Agregar Paso"
          variant="outline"
          className="w-full"
        />

        {/* Confirm modal */}
        {pendingDelete !== null && (
          <ConfirmModal
            title="¿Eliminar paso?"
            description={`Eliminar paso "${steps[pendingDelete]?.title}" de la sección Cómo Funciona.`}
            confirmLabel="Eliminar"
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => deleteStep(pendingDelete)}
          />
        )}
      </div>
    </AutoTranslateWrapper>
  );
}
