# parseTitle Syntax Guide

The `parseTitle` utility allows you to format section headlines with multi-line breaks and color highlighting using a simple syntax in your `config.json` translations.

## Location

- **Utility**: `src/lib/parseTitle.tsx`
- **Usage**: Import and use in section components to replace `dangerouslySetInnerHTML`

## Syntax

### Line Breaks

Use `\n` (escaped backslash-n) to create line breaks:

```json
"headline": "First line\\nSecond line"
```

**Result**: Text will render on two separate lines with a `<br />` tag between them.

### Color Highlighting

Wrap text in special delimiters to apply color classes:

| Syntax | Color Class | Use Case |
|--------|-------------|----------|
| `{{text}}` | `text-primary` | Primary brand color (orange by default) |
| `[[text]]` | `text-accent` | Accent color |
| `((text))` | `text-success` | Success/positive emphasis |
| `<<text>>` | `text-warning` | Warning/attention |

### Combining Line Breaks and Colors

You can combine both features:

```json
"headline": "Todo lo que un negocio necesita.\\n{{Nada que no usés.}}"
```

**Result**: 
- Line 1: "Todo lo que un negocio necesita."
- Line 2: "Nada que no usés." (in primary color)

## Examples from config.json

### Hero Section
```json
"headline": "El POS que cumple con {{Hacienda}} sin cobrarte mensualidad."
```
Highlights "Hacienda" in primary color.

### Features Section
```json
"headline": "Todo lo que un negocio necesita.\\n{{Nada que no usés.}}"
```
Two lines, second line in primary color.

### VS Competition Section
```json
"headline": "Pagás {{una vez}}. Vendés {{para siempre}}."
```
Highlights both "una vez" and "para siempre" in primary color.

### How It Works Section
```json
"headline": "De cero a vendiendo en {{5 minutos}}."
```
Highlights "5 minutos" in primary color.

### Hacienda Section
```json
"headline": "Versión 4.4. {{Lista hoy}}."
```
Highlights "Lista hoy" in primary color.

### Pricing Section
```json
"headline": "Empezá gratis. {{Crecé sin atarte}}."
```
Highlights "Crecé sin atarte" in primary color.

## Implementation in Components

### Before (using dangerouslySetInnerHTML)
```tsx
<h2
  className="font-display font-extrabold"
  dangerouslySetInnerHTML={{
    __html: t('section.headline')
      .replace('text', '<span class="text-primary">text</span>')
  }}
/>
```

### After (using parseTitle)
```tsx
import { parseTitle } from '@/lib/parseTitle';

<h2 className="font-display font-extrabold">
  {parseTitle(t('section.headline'))}
</h2>
```

## Benefits

1. **Safer**: No need for `dangerouslySetInnerHTML`
2. **Cleaner**: All formatting defined in config.json
3. **Consistent**: Same syntax across all sections
4. **Flexible**: Easy to add/remove colors without touching component code
5. **Controlled**: Avoids "rainbows" by keeping color choices intentional

## Notes

- The `\n` must be escaped as `\\n` in JSON files
- Multiple color highlights can be used in the same line
- Colors are defined by your theme's CSS variables
- The utility returns React nodes, not HTML strings
