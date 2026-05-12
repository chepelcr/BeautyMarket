# Auto-Translation Guide

## Overview

The dashboard now supports **automatic translation** using the browser's built-in Translator API. When you switch languages and the target language content is missing, the system will automatically translate from the source language.

## Browser Support

### ✅ Supported Browsers:
- **Chrome 130+** (with AI features enabled)
- **Edge 130+** (with AI features enabled)
- **Chromium-based browsers** with experimental features

### ❌ Not Supported:
- Firefox (no Translator API yet)
- Safari (no Translator API yet)
- Older Chrome/Edge versions

### How to Enable (Chrome/Edge):

1. Open `chrome://flags` or `edge://flags`
2. Search for "Translation API"
3. Enable "Translation API"
4. Restart browser

## How It Works

### Automatic Translation Flow:

1. **User switches language** (ES → EN or EN → ES)
2. **System checks** if target language content exists
3. **If missing:**
   - Checks if Translator API is available
   - Auto-translates from source language
   - Saves translated content to config
   - Shows success notification
4. **If API unavailable:**
   - Shows warning message
   - User must add content manually

### Features:

- ✅ **Caching** - Translations are cached to avoid re-translating
- ✅ **Fallback** - Shows original text if translation fails
- ✅ **Non-blocking** - UI remains responsive during translation
- ✅ **Smart detection** - Only translates when content is truly missing
- ✅ **Recursive** - Translates nested objects and arrays

## Usage in Dashboard Tabs

### Example: PricingAddonsTab with Auto-Translation

```typescript
import { AutoTranslateWrapper } from '@/dashboard/components/AutoTranslateWrapper';
import { useConfig } from '@/hooks/useConfig';

export function PricingAddonsTab() {
  const { config, setConfig } = useConfig();
  const [lang, setLang] = useState<'es' | 'en'>('es');

  const addons = config.translations[lang]?.pricing?.addons ?? [];
  const sourceAddons = config.translations[lang === 'es' ? 'en' : 'es']?.pricing?.addons ?? [];

  const handleAutoTranslated = (translatedAddons: any[]) => {
    // Save auto-translated content to config
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        [lang]: {
          ...config.translations[lang],
          pricing: {
            ...config.translations[lang]?.pricing,
            addons: translatedAddons,
          },
        },
      },
    });
  };

  return (
    <AutoTranslateWrapper
      sourceData={sourceAddons}
      targetData={addons}
      sourceLang={lang === 'es' ? 'en' : 'es'}
      targetLang={lang}
      onTranslated={handleAutoTranslated}
      enabled={true}
    >
      {/* Your tab content here */}
      <div className="space-y-6">
        {/* Language selector */}
        <LanguageSelector lang={lang} setLang={setLang} />
        
        {/* Addons grid */}
        <div className="grid gap-3">
          {addons.map((addon, i) => (
            <AddonCard key={i} addon={addon} />
          ))}
        </div>
      </div>
    </AutoTranslateWrapper>
  );
}
```

### Direct Hook Usage (Advanced)

For more control, use the `useAutoTranslate` hook directly:

```typescript
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

function MyComponent() {
  const { translate, translateObject, isReady } = useAutoTranslate({
    sourceLanguage: 'es',
    targetLanguage: 'en',
    enabled: true,
  });

  // Translate a single string
  const translatedText = await translate('Hola mundo');
  
  // Translate an object
  const translatedObj = await translateObject({
    title: 'Mi título',
    description: 'Mi descripción',
    items: ['Item 1', 'Item 2'],
  });
}
```

## API Reference

### `useAutoTranslate` Hook

```typescript
const {
  translate,        // (text: string) => Promise<string>
  translateObject,  // <T>(obj: T) => Promise<T>
  isAvailable,      // boolean - API available in browser
  isLoading,        // boolean - Creating translator instance
  isReady,          // boolean - Ready to translate
} = useAutoTranslate({
  sourceLanguage: 'es',
  targetLanguage: 'en',
  enabled: true,
});
```

### `AutoTranslateWrapper` Component

```typescript
<AutoTranslateWrapper
  sourceData={sourceContent}      // Content in source language
  targetData={targetContent}      // Content in target language (may be empty)
  sourceLang="es"                 // Source language code
  targetLang="en"                 // Target language code
  onTranslated={(data) => {...}}  // Callback with translated data
  enabled={true}                  // Enable/disable translation
>
  {children}
</AutoTranslateWrapper>
```

## Translation Quality

### ✅ Good For:
- Short text (titles, labels, buttons)
- Descriptions and explanations
- UI text and messages
- Product names and features

### ⚠️ May Need Review:
- Marketing copy (may lose tone/style)
- Technical terms (may be inaccurate)
- Idioms and expressions
- Brand-specific terminology

### 💡 Best Practices:
1. **Review auto-translations** before publishing
2. **Edit as needed** - translations are editable
3. **Use as starting point** - not final copy
4. **Test with users** - especially for marketing content

## Limitations

1. **Browser-dependent** - Only works in Chrome/Edge 130+
2. **Requires download** - First use may download AI model (~50-100MB)
3. **Quota limits** - Some browsers limit translation requests
4. **Quality varies** - Not as good as professional translation
5. **No context** - Doesn't understand brand voice or domain-specific terms

## Fallback Strategy

When Translator API is unavailable:

1. **Show warning** - User knows they need to add content manually
2. **Keep original** - Source language content remains visible
3. **Manual entry** - User can type translations directly
4. **Copy-paste** - User can use external translation tools

## Future Enhancements

- [ ] Add translation quality indicator
- [ ] Allow user to approve/reject translations
- [ ] Support custom translation glossary
- [ ] Batch translation for multiple items
- [ ] Translation history and undo
- [ ] Export/import translations

## Troubleshooting

### "Translation API not available"
- **Solution**: Update to Chrome/Edge 130+ and enable in flags

### "Downloaded X%"
- **Normal**: First use downloads AI model, wait for completion

### "Translation failed"
- **Check**: Internet connection
- **Check**: Browser console for errors
- **Fallback**: Add content manually

### Translations are poor quality
- **Solution**: Edit manually after auto-translation
- **Tip**: Use as starting point, not final copy

## Resources

- [MDN: Translator API](https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs)
- [Chrome AI Features](https://developer.chrome.com/docs/ai/)
- [Browser Compatibility](https://caniuse.com/?search=translator)

## Status: ✅ IMPLEMENTED

Auto-translation is now available in the dashboard. Enable it in your browser flags to use!
