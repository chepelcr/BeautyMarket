# Section IDs Reference - POS Landing

Quick reference for all section IDs used in hash navigation.

## Section IDs

| Section | ID | Hash Link | Component File |
|---------|----|-----------| ---------------|
| Hero | `top` | `#top` or `/#top` | `Hero.tsx` |
| VS Competition | `vs` | `#vs` or `/#vs` | `VsCompetition.tsx` |
| Features | `caracteristicas` | `#caracteristicas` or `/#caracteristicas` | `Features.tsx` |
| How It Works | `como` | `#como` or `/#como` | `HowItWorks.tsx` |
| Hacienda Compliance | `hacienda` | `#hacienda` or `/#hacienda` | `Hacienda.tsx` |
| Pricing | `precios` | `#precios` or `/#precios` | `Pricing.tsx` |
| Testimonials | `testimonios` | `#testimonios` or `/#testimonios` | `Testimonials.tsx` |
| FAQ | `preguntas` | `#preguntas` or `/#preguntas` | `FAQ.tsx` |
| Final CTA / Login | `login` | `#login` or `/#login` | `FinalCta.tsx` |

## Usage Examples

### In React Components (Same Page)
```tsx
// Using anchor tag
<a href="#precios">Ver precios</a>

// Using button with scroll
<button onClick={() => {
  document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' });
}}>
  Ver precios
</button>
```

### In React Components (Cross-Page)
```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const goToPricing = () => {
    navigate('/');
    setTimeout(() => {
      document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  return <button onClick={goToPricing}>Ver precios</button>;
}
```

### In HTML / External Links
```html
<!-- Direct link to section -->
<a href="https://pos-landing.tsuru.jcampos.dev/#precios">Ver precios</a>

<!-- Link from another page -->
<a href="/#caracteristicas">Ver características</a>
```

### In Navigation Config
```typescript
const NAV_LINKS = [
  { href: '/#caracteristicas', label: 'Características' },
  { href: '/#hacienda',        label: 'Hacienda 4.4' },
  { href: '/#precios',         label: 'Precios' },
  { href: '/#preguntas',       label: 'Preguntas' },
];
```

## Navigation Flow

```
User clicks link with hash
         ↓
Check if on landing page
         ↓
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    │    Navigate to /
    │         │
    └────┬────┘
         ↓
  Find element by ID
         ↓
  Smooth scroll to element
```

## Adding New Sections

To add a new section with hash navigation:

1. **Add ID to section component:**
```tsx
export function MyNewSection() {
  return (
    <section id="mi-seccion" className="py-20">
      {/* content */}
    </section>
  );
}
```

2. **Add to navigation (optional):**
```typescript
// In TopNav.tsx
const NAV_LINKS = [
  // ... existing links
  { href: '/#mi-seccion', key: 'mySection' },
];
```

3. **Add translation (if using nav):**
```json
// In config.json translations
{
  "nav": {
    "mySection": "Mi Sección"
  }
}
```

4. **Update this reference:**
Add the new section to the table above.

## Best Practices

✅ **Use descriptive IDs:** `precios` instead of `section-3`
✅ **Use Spanish IDs:** Match the primary language of the site
✅ **Keep IDs short:** Easy to type and remember
✅ **Use hyphens:** `como-funciona` not `comoFunciona` or `como_funciona`
✅ **Test cross-page:** Ensure links work from `/demo` and `/dashboard`
✅ **Add smooth scroll:** Always use `{ behavior: 'smooth' }`

## Troubleshooting

### Link doesn't scroll
- Check if ID exists: `document.getElementById('precios')`
- Check if section is rendered (not lazy-loaded and hidden)
- Check if section has `display: none` or `visibility: hidden`

### Scroll position is off
- Check if there's a sticky header (adjust scroll position)
- Use `scrollIntoView({ behavior: 'smooth', block: 'start' })`

### Cross-page navigation doesn't work
- Ensure you navigate to `/` first
- Add a small timeout (100ms) before scrolling
- Check if React Router is properly configured

## Related Files

- `src/components/layout/TopNav.tsx` - Main navigation with hash links
- `src/components/sections/*.tsx` - All section components with IDs
- `src/pages/LandingPage.tsx` - Renders all sections
- `public/config.json` - Navigation translations
