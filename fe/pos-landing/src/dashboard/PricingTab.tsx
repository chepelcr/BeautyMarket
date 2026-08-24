/**
 * PricingTab - Orchestrator
 * Manages pricing configuration, master features, and plans
 */

import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Icon } from '@/components/ui/Icon';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AutoTranslateWrapper, LangToggle } from './components';
import { 
  PricingConfigPanel, 
  MasterFeaturesPanel, 
  PlanCard,
  EMPTY_PLAN,
  type Plan,
  type FeatureDef
} from './pricing';

export function PricingTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  
  const pricing = config.pricing;
  const plans = config.translations[lang]?.pricing?.plans ?? [];
  const features = config.translations[lang]?.pricing?.features ?? [];

  const setPricing = (next: Partial<typeof pricing>) =>
    setConfig({ ...config, pricing: { ...pricing, ...next } });

  const setPlan = (i: number, plan: Plan) => {
    const updatedPlans = [...plans];
    updatedPlans[i] = plan;
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          pricing: {
            ...config.translations[lang].pricing,
            plans: updatedPlans,
          },
        },
      },
    });
  };

  const setFeatures = (newFeatures: FeatureDef[]) => {
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          pricing: {
            ...config.translations[lang].pricing,
            features: newFeatures,
          },
        },
      },
    });
  };

  const addPlan = () => {
    const updatedPlans = [...plans, EMPTY_PLAN()];
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          pricing: {
            ...config.translations[lang].pricing,
            plans: updatedPlans,
          },
        },
      },
    });
  };
  
  const removePlan = (i: number) => {
    const updatedPlans = plans.filter((_, idx) => idx !== i);
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          pricing: {
            ...config.translations[lang].pricing,
            plans: updatedPlans,
          },
        },
      },
    });
    setPendingDelete(null);
  };

  const handleAutoTranslate = (translatedData: any) => {
    if (translatedData.plans) {
      setConfig({
        ...config,
        translations: {
          ...config.translations,
          [lang]: {
            ...config.translations[lang],
            pricing: {
              ...config.translations[lang].pricing,
              ...translatedData,
            },
          },
        },
      });
    }
  };

  const sourceLang = lang === 'en' ? 'es' : 'en';
  const sourceData = config.translations[sourceLang]?.pricing;
  const targetData = config.translations[lang]?.pricing;

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

        <PricingConfigPanel pricing={pricing} onChange={setPricing} />

        <MasterFeaturesPanel features={features} onChange={setFeatures} />

        {/* Plans List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base">Planes ({plans.length})</h3>
            <button
              onClick={addPlan}
              className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90"
            >
              <Icon name="Plus" size={14} />Agregar plan
            </button>
          </div>

          {plans.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currency={pricing.currency}
              usdRate={pricing.usdRateCRC}
              masterFeatures={features}
              onChange={p => setPlan(i, p)}
              onDelete={() => setPendingDelete(i)}
              isLastPlan={i === plans.length - 1}
            />
          ))}
        </div>

        {pendingDelete !== null && (
          <ConfirmModal
            title={`¿Eliminar "${plans[pendingDelete].name}"?`}
            description="Esto elimina permanentemente el plan de config.json. Otros planes no se ven afectados."
            confirmLabel="Eliminar plan"
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => removePlan(pendingDelete)}
          />
        )}
      </div>
    </AutoTranslateWrapper>
  );
}
