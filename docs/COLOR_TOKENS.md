# Color Token System - Complete Reference

## Overview

BeautyMarket now uses a modern **Blue + Lime Green** color palette with a comprehensive token system for easy color management and theme switching.

---

## Brand Colors

### Primary - Modern Blue
- **Token:** `--brand-blue-500`
- **HSL:** `217 91% 60%`
- **Hex:** `#3b82f6`
- **Usage:** Main brand color for buttons, borders, primary actions

**Blue Scale:**
```css
--brand-blue-50:   217 100% 97%  /* Lightest */
--brand-blue-100:  217 100% 94%
--brand-blue-500:  217 91% 60%   /* Primary */
--brand-blue-600:  217 91% 52%   /* Hover */
--brand-blue-700:  217 91% 44%   /* Active */
```

### Secondary - Lime Green
- **Token:** `--brand-lime-500`
- **HSL:** `84 81% 44%`
- **Hex:** `#8dc21f`
- **Usage:** Accent color, secondary actions, highlights

**Lime Scale:**
```css
--brand-lime-50:   84 100% 95%   /* Lightest */
--brand-lime-100:  84 90% 90%
--brand-lime-500:  84 81% 44%    /* Primary */
--brand-lime-600:  84 81% 38%    /* Hover */
--brand-lime-700:  84 81% 32%    /* Active */
```

---

## Semantic Color Tokens

### Light Mode

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `0 0% 100%` | Page background (White) |
| `--foreground` | `222.2 84% 4.9%` | Primary text (Dark) |
| `--card` | `0 0% 100%` | Card backgrounds |
| `--card-foreground` | `222.2 84% 4.9%` | Card text |
| `--primary` | `217 91% 60%` | Primary actions (Blue) |
| `--primary-foreground` | `210 40% 98%` | Text on primary (White) |
| `--secondary` | `84 81% 44%` | Secondary actions (Lime) |
| `--secondary-foreground` | `210 40% 98%` | Text on secondary (White) |
| `--accent` | `84 81% 44%` | Accent elements (Lime) |
| `--accent-foreground` | `210 40% 98%` | Text on accent (White) |
| `--muted` | `210 40% 96.1%` | Disabled/inactive elements |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Muted text |
| `--border` | `214.3 31.8% 91.4%` | Borders |
| `--input` | `214.3 31.8% 91.4%` | Input backgrounds |
| `--destructive` | `0 84.2% 60.2%` | Error/danger states (Red) |
| `--destructive-foreground` | `210 40% 98%` | Text on destructive (White) |

### Dark Mode

Dark mode automatically adjusts:
- **Background:** Becomes dark slate (`222.2 84% 4.9%`)
- **Foreground:** Becomes light gray (`210 40% 98%`)
- **Cards:** Become `slate-700` or `slate-800`
- **Primary/Secondary:** Remain same for consistency
- **Muted:** Becomes `slate-600` shades

---

## Tailwind Utility Classes

### Color Tokens in Tailwind

All tokens are available as Tailwind utilities:

```jsx
// Background
<div className="bg-primary">...</div>           // Blue
<div className="bg-secondary">...</div>         // Lime
<div className="bg-accent">...</div>            // Lime
<div className="bg-background">...</div>        // Page bg
<div className="bg-card">...</div>              // Card bg

// Text
<p className="text-foreground">...</p>          // Primary text
<p className="text-primary">...</p>             // Blue text
<p className="text-secondary">...</p>           // Lime text
<p className="text-muted-foreground">...</p>    // Muted text

// Borders
<div className="border border-primary">...</div>        // Blue border
<div className="border border-secondary">...</div>      // Lime border
<div className="border border-muted">...</div>          // Muted border

// With opacity
<div className="bg-primary/10">...</div>        // 10% opacity primary
<div className="text-primary/70">...</div>      // 70% opacity text
<div className="border-primary/20">...</div>    // 20% opacity border
```

---

## Custom Component Classes

Pre-defined utility classes for common patterns:

### Button Variants

```jsx
<Button className="btn-primary">Primary Action</Button>
<Button className="btn-secondary">Secondary Action</Button>
<Button className="btn-accent">Accent Action</Button>
<Button className="btn-ghost">Ghost Button</Button>
<Button className="btn-outline">Outline Button</Button>
```

### Card Variants

```jsx
<div className="card-primary">...</div>         // Blue primary card
<div className="card-accent">...</div>          // Lime accent card
<div className="card-subtle">...</div>          // Muted subtle card
```

### Background Variants

```jsx
<div className="bg-primary-light">...</div>     // Primary with 10% opacity
<div className="bg-accent-light">...</div>      // Accent with 10% opacity
<div className="bg-secondary-light">...</div>   // Secondary with 10% opacity
```

### Gradient Variants

```jsx
<div className="gradient-primary">...</div>           // Blue gradient
<div className="gradient-accent">...</div>            // Lime gradient
<div className="gradient-primary-accent">...</div>    // Blue to Lime gradient
```

### Text Variants

```jsx
<span className="text-primary">...</span>       // Blue text
<span className="text-secondary">...</span>     // Lime text
<span className="text-accent">...</span>        // Lime text
<span className="text-muted">...</span>         // Muted text
```

### Icon Variants

```jsx
<Icon className="icon-primary">...</Icon>      // Blue icon
<Icon className="icon-accent">...</Icon>       // Lime icon
<Icon className="icon-muted">...</Icon>        // Muted icon
```

### Focus States

```jsx
<input className="focus-primary" />             // Blue focus ring
<input className="focus-accent" />              // Lime focus ring
```

---

## Dark Mode Support

All tokens automatically adapt to dark mode:

```jsx
// Light mode
<div className="bg-background">White background</div>

// Dark mode (automatic)
// Same element becomes dark slate background

// Forced specific behavior
<div className="dark:bg-slate-900">Custom dark override</div>
```

**Slate Colors for Dark Mode:**
- `slate-700`: `#1e293b`
- `slate-800`: `#1e293b` (darker)
- `slate-900`: `#0f172a` (darkest)

---

## Migration Guide

### Old → New Token Mapping

| Old Color | Old Usage | New Token | New Usage |
|-----------|-----------|-----------|-----------|
| `bg-pink-50` | Gradient backgrounds | `from-primary/10` | Primary light gradient |
| `bg-pink-100` | Light backgrounds | `to-primary/20` | Primary lighter gradient |
| `bg-pink-500` | Primary buttons | `btn-primary` | Primary button utility |
| `bg-pink-600` | Button hover | `hover:bg-primary/90` | Primary hover |
| `text-pink-500` | Primary text | `text-primary` | Primary text |
| `border-pink-500` | Highlighted borders | `border-primary` | Primary border |
| `bg-white` | Card backgrounds | `bg-card` | Card background |
| `dark:bg-gray-700` | Dark cards | `dark:bg-slate-700` | Dark card |
| `dark:bg-gray-800` | Dark sections | `dark:bg-slate-800` | Dark section |

### Search/Replace Examples

**Buttons:**
```
OLD: className="bg-pink-500 hover:bg-pink-600"
NEW: className="btn-primary"
```

**Links:**
```
OLD: className="text-pink-500"
NEW: className="text-primary"
```

**Gradients:**
```
OLD: className="from-pink-50 to-pink-100"
NEW: className="from-primary/10 to-primary/20"
```

**Cards:**
```
OLD: className="bg-white dark:bg-gray-700"
NEW: className="bg-card dark:bg-slate-700"
```

---

## Best Practices

### ✅ Do

- Use semantic tokens for consistent theming
- Use custom utility classes (`.btn-primary`, `.card-primary`) for common patterns
- Use opacity modifiers (`/10`, `/20`, `/90`) for variant shades
- Use dark mode utilities for automatic theme support
- Reference CSS variables in dynamic styles

```jsx
<div style={{ color: `hsl(var(--primary))` }}>Dynamic color</div>
```

### ❌ Don't

- Hardcode hex colors (`#3b82f6`) - use tokens instead
- Use old pink colors (`bg-pink-500`) - migrate to new system
- Mix token approaches (half CSS variables, half Tailwind classes)
- Forget dark mode variants
- Create custom colors without adding to token system

---

## CSS Variables Reference

Location: `landing-client/src/index.css`

```css
/* Access in CSS */
color: hsl(var(--primary));
background: hsl(var(--secondary) / 0.1);
border-color: hsl(var(--border));

/* Access in inline styles */
style={{ backgroundColor: `hsl(var(--primary))` }}

/* Access in Tailwind */
className="bg-primary text-primary border-primary"
```

---

## Testing Colors

To verify color tokens are working:

1. **Light Mode:** Page should show:
   - Blue buttons and accents
   - White backgrounds
   - Dark text

2. **Dark Mode:** Page should show:
   - Blue buttons and accents (same as light)
   - Dark slate backgrounds
   - Light text

3. **Opacity:** Check semi-transparent colors work:
   - `bg-primary/10` should show very light blue
   - `text-muted/70` should show muted text

---

## Related Files

- **Token Definition:** `landing-client/src/index.css`
- **Tailwind Config:** `landing-client/tailwind.config.js`
- **Component Patterns:** `docs/COMPONENT_PATTERNS.md`
- **Migration Guide:** `docs/AI_AGENT_COLORS.md`

---

## Questions?

Refer to the component patterns guide for specific use cases, or check the AI_AGENT_COLORS reference for systematic migration steps.
