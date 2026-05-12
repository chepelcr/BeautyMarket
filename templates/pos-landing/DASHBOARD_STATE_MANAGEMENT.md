# Dashboard State Management - How It Works

## Question 3: Do Changes Persist When Switching Tabs?

### ✅ YES! Changes persist in memory

When you edit content in a tab and switch to another tab **without clicking "Save to disk"**, your changes are **NOT lost**. Here's why:

### How It Works:

```
User edits content in Tab A
         ↓
setConfig() updates React state (in memory)
         ↓
User switches to Tab B
         ↓
Tab A unmounts, Tab B mounts
         ↓
Both tabs read from same config state
         ↓
User switches back to Tab A
         ↓
Tab A mounts with updated config state
         ↓
Changes are still there! ✅
```

### State Flow:

```typescript
// ConfigContext.tsx - Single source of truth
const [config, setConfig] = useState<AppConfig>(initialConfig);

// Tab A updates config
setConfig({ ...config, translations: { ...newData } });
// ↓ State updated in memory

// User switches to Tab B
// ↓ Tab A unmounts, Tab B mounts

// User switches back to Tab A
// ↓ Tab A mounts and reads from config state
// ↓ Changes are still there!
```

### When Changes Are Lost:

❌ **Only lost if:**
1. User refreshes the page (F5)
2. User closes the browser tab
3. User navigates away from dashboard
4. Browser crashes

✅ **Saved permanently when:**
- User clicks "Save to disk" button
- Changes are written to `config.json`

### Visual Indicator:

The dashboard shows:
- **"Saved ✓"** - After clicking "Save to disk"
- **No indicator** - Changes in memory but not saved to disk

### Best Practice:

**Save frequently!** Click "Save to disk" after making important changes to avoid losing work if browser crashes or page refreshes.

---

## Question 2: Is Auto-Translator Implemented in All Sections?

### ❌ NO - Not yet implemented

I created the **tools** (hook + wrapper component), but haven't integrated them into the tabs yet.

### What's Ready:

✅ `useAutoTranslate` hook - Translation functionality  
✅ `AutoTranslateWrapper` component - UI wrapper  
✅ Documentation - How to use it

### What's Needed:

❌ Wrap each tab with `AutoTranslateWrapper`  
❌ Add translation callbacks  
❌ Test with each section

### Tabs That Need It:

1. ❌ PricingAddonsTab
2. ❌ FeaturesTab
3. ❌ TestimonialsTab
4. ❌ FAQTab
5. ❌ HowItWorksTab
6. ❌ HaciendaTab
7. ❌ VSCompetitionTab
8. ❌ PricingTab (after refactor)

### Quick Integration Example:

```typescript
// Before
export function MyTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  
  const items = config.translations[lang]?.section?.items ?? [];
  
  return (
    <div>
      {/* Tab content */}
    </div>
  );
}

// After
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
      <div>
        {/* Tab content */}
      </div>
    </AutoTranslateWrapper>
  );
}
```

---

## Question 1: Making Pricing Section Fully Translated

### Current Problem:

Pricing plans are in `config.pricing.plans` (not language-specific):

```json
{
  "pricing": {
    "plans": [
      {
        "name": "Free",
        "tagline": "Para empezar tu negocio...",
        "ctaLabel": "Crear cuenta gratis",
        "features": [...]
      }
    ]
  }
}
```

### Solution: Move to Translations

Plans need to be in `config.translations.{lang}.pricing.plans`:

```json
{
  "translations": {
    "es": {
      "pricing": {
        "plans": [
          {
            "name": "Free",
            "tagline": "Para empezar tu negocio...",
            "ctaLabel": "Crear cuenta gratis"
          }
        ]
      }
    },
    "en": {
      "pricing": {
        "plans": [
          {
            "name": "Free",
            "tagline": "To start your business...",
            "ctaLabel": "Create free account"
          }
        ]
      }
    }
  }
}
```

### What Stays in `config.pricing`:

Only **non-translatable** settings:

```json
{
  "pricing": {
    "currency": "USD",
    "usdRateCRC": 600,
    "freeDocs": 30,
    "amortizationMonths": 36,
    "moneyBackDays": 30
  }
}
```

### Refactor Required:

1. **Move plans to translations** - Both ES and EN
2. **Update PricingTab** - Add language selector
3. **Update Pricing component** - Read from translations
4. **Update types** - Adjust TypeScript types
5. **Migrate existing data** - Copy current plans to both languages

### Impact:

- ✅ Plans can be translated
- ✅ Features can be translated
- ✅ CTAs can be translated
- ✅ Consistent with other sections
- ⚠️ Breaking change - requires data migration

---

## Summary

### Question 1: Pricing Translation
**Status:** ❌ Not implemented  
**Action:** Requires refactor to move plans to translations

### Question 2: Auto-Translator in All Sections
**Status:** ❌ Not implemented  
**Action:** Need to wrap each tab with AutoTranslateWrapper

### Question 3: Content Persistence
**Status:** ✅ Already works!  
**Action:** None needed - changes persist in memory

---

## Next Steps

### Priority 1: Content Persistence (Already Done ✅)
No action needed - it already works!

### Priority 2: Auto-Translator Integration
Wrap each tab with AutoTranslateWrapper:
1. PricingAddonsTab ✅ (already has language toggle)
2. FeaturesTab
3. TestimonialsTab
4. FAQTab
5. HowItWorksTab
6. HaciendaTab
7. VSCompetitionTab

### Priority 3: Pricing Refactor
Move pricing plans to translations:
1. Create migration script
2. Update config.json structure
3. Update PricingTab component
4. Update Pricing section component
5. Add language toggle to PricingTab
6. Test thoroughly

Would you like me to:
A) Integrate auto-translator into all tabs first?
B) Refactor pricing section to be translatable first?
C) Both at the same time?
