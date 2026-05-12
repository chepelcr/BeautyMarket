# Pricing Refactor + Auto-Translate Integration - IN PROGRESS

## ✅ Step 1: Config Structure - COMPLETE

### What Was Done:

1. **Removed plans from `config.pricing`**
   - Kept only non-translatable settings (currency, rates, numbers)
   
2. **Fixed duplicate pricing keys in ES translations**
   - Removed incorrect English pricing from ES section
   
3. **Added plans and features to ES translations**
   - `config.translations.es.pricing.plans` ✅
   - `config.translations.es.pricing.features` ✅
   
4. **Added plans and features to EN translations**
   - `config.translations.en.pricing.plans` ✅
   - `config.translations.en.pricing.features` ✅

### New Structure:

```json
{
  "pricing": {
    "currency": "USD",
    "usdRateCRC": 600,
    "freeDocs": 30,
    "amortizationMonths": 36,
    "moneyBackDays": 30
  },
  "translations": {
    "es": {
      "pricing": {
        "eyebrow": "...",
        "headline": "...",
        "addons": [...],
        "features": [...],  // NEW
        "plans": [...]      // NEW
      }
    },
    "en": {
      "pricing": {
        "eyebrow": "...",
        "headline": "...",
        "addons": [...],
        "features": [...],  // NEW
        "plans": [...]      // NEW
      }
    }
  }
}
```

---

## ⏳ Step 2: Update PricingTab Component - TODO

### What Needs To Be Done:

1. **Add language toggle**
   ```typescript
   const [lang, setLang] = useState<'es' | 'en'>('es');
   ```

2. **Read from translations instead of config.pricing**
   ```typescript
   // Before
   const plans = config.pricing.plans;
   const features = config.pricing.features;
   
   // After
   const plans = config.translations[lang]?.pricing?.plans ?? [];
   const features = config.translations[lang]?.pricing?.features ?? [];
   ```

3. **Update setPlan to write to translations**
   ```typescript
   const setPlan = (i: number, plan: Plan) => {
     setConfig({
       ...config,
       translations: {
         ...config.translations,
         [lang]: {
           ...config.translations[lang],
           pricing: {
             ...config.translations[lang]?.pricing,
             plans: plans.map((p, idx) => idx === i ? plan : p),
           },
         },
       },
     });
   };
   ```

4. **Update FeaturesPanel to write to translations**

5. **Add AutoTranslateWrapper**

---

## ⏳ Step 3: Update Pricing Section Component - TODO

The landing page Pricing section component needs to read from translations:

```typescript
// Before
const plans = config.pricing.plans;

// After  
const plans = config.translations[lang]?.pricing?.plans ?? [];
```

---

## ⏳ Step 4: Integrate Auto-Translate in All Tabs - TODO

### Tabs To Update:

1. ❌ PricingTab (after refactor)
2. ❌ PricingAddonsTab
3. ❌ FeaturesTab
4. ❌ TestimonialsTab
5. ❌ FAQTab
6. ❌ HowItWorksTab
7. ❌ HaciendaTab
8. ❌ VSCompetitionTab

### Integration Pattern:

```typescript
import { AutoTranslateWrapper } from '@/dashboard/components/AutoTranslateWrapper';

export function MyTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  
  const items = config.translations[lang]?.section?.items ?? [];
  const sourceItems = config.translations[lang === 'es' ? 'en' : 'es']?.section?.items ?? [];
  
  return (
    <AutoTranslateWrapper
      sourceData={sourceItems}
      targetData={items}
      sourceLang={lang === 'es' ? 'en' : 'es'}
      targetLang={lang}
      onTranslated={(translated) => {
        setConfig({
          ...config,
          translations: {
            ...config.translations,
            [lang]: {
              ...config.translations[lang],
              section: {
                ...config.translations[lang]?.section,
                items: translated,
              },
            },
          },
        });
      }}
    >
      {/* Tab content */}
    </AutoTranslateWrapper>
  );
}
```

---

## Current Status

### ✅ Completed:
- Config structure refactored
- Plans moved to translations
- Features moved to translations
- Both ES and EN have complete data
- Auto-translate hook created
- Auto-translate wrapper created

### ⏳ In Progress:
- PricingTab component refactor

### ❌ Not Started:
- Pricing section component update
- Auto-translate integration in tabs
- Testing

---

## Next Actions

**Option A: Complete PricingTab refactor first**
- Update component to read from translations
- Add language toggle
- Test thoroughly
- Then integrate auto-translate

**Option B: Do simpler tabs first**
- Integrate auto-translate in other tabs (easier)
- Build confidence with the pattern
- Then tackle PricingTab refactor

**Recommendation: Option B**
- Get auto-translate working in simpler tabs first
- See it in action
- Then tackle the complex PricingTab refactor

---

## Files Modified So Far

1. ✅ `public/config.json` - Structure refactored
2. ⏳ `src/dashboard/PricingTab.tsx` - Needs update
3. ❌ `src/components/sections/Pricing.tsx` - Needs update
4. ❌ All other dashboard tabs - Need auto-translate integration

---

## Breaking Changes

⚠️ **The PricingTab will break until Step 2 is complete!**

The component is currently trying to read `config.pricing.plans` which no longer exists. It needs to be updated to read from `config.translations[lang].pricing.plans`.

---

## Estimated Time

- Step 2 (PricingTab refactor): 30-45 minutes
- Step 3 (Pricing section update): 15 minutes  
- Step 4 (Auto-translate all tabs): 60-90 minutes

**Total: 2-3 hours of work**

---

## Decision Point

**What should I do next?**

A) Continue with PricingTab refactor (fix the breaking change)
B) Integrate auto-translate in simpler tabs first (see it working)
C) Both in parallel (risky but faster)

**Your choice?**
