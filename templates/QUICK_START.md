# Tech Gadgets Template - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
cd templates/tech-gadgets
npm install
```

This installs all required packages:
- React 18, React DOM
- Vite, TypeScript
- Tailwind CSS
- Wouter (routing)
- Lucide React (icons)
- Radix UI components
- And more...

### 2. Start Development Server
```bash
npm run dev
```

Or from root directory:
```bash
npm run dev:template:tech-gadgets
```

Open browser to: **http://localhost:3002**

### 3. Build for Production
```bash
npm run build
```

Or from root:
```bash
npm run build:template:tech-gadgets
```

Output location: `../../dist/templates/tech-gadgets/`

### 4. Preview Production Build
```bash
npm run preview
```

## Project Structure Overview

```
tech-gadgets/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── ProductsPage.tsx      # Product listing
│   │   └── ProductDetailPage.tsx # Product details
│   ├── App.tsx                   # Router
│   ├── main.tsx                  # Entry
│   ├── index.css                 # Styles
│   └── theme.ts                  # Theme config
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## Key Files Explained

### vite.config.ts
- Builds to: `dist/templates/tech-gadgets`
- Dev server: Port 3002
- Code splitting configured
- Path alias: `@` → `src/`

### tailwind.config.ts
- Dark mode enabled via class
- Custom tech colors
- Roboto font
- Custom animations

### src/theme.ts
- Complete theme configuration
- Color palette
- Typography settings
- Component styles
- Dark mode settings

### src/index.css
- CSS custom properties
- Tech-specific utilities
- Gradient effects
- Glow animations
- Dark/light mode variables

## Available Routes

- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product detail

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Router:** Wouter 3
- **Icons:** Lucide React
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod
- **State:** Zustand
- **Language:** TypeScript 5

## Theme Customization

### Colors (src/theme.ts)
```typescript
colors: {
  primary: '#1e3a8a',    // Blue-900
  secondary: '#06b6d4',  // Cyan-500
  accent: '#3b82f6',     // Blue-500
  background: '#0f172a', // Slate-900
  // ... more
}
```

### CSS Variables (src/index.css)
```css
:root {
  --background: 222.47 47.37% 11.18%;
  --primary: 221.21 83.19% 53.33%;
  --tech-cyan: 187.85 84.62% 43.14%;
  /* ... more */
}
```

### Tailwind Config
```typescript
theme: {
  extend: {
    colors: {
      'tech-blue': 'var(--tech-blue)',
      'tech-cyan': 'var(--tech-cyan)',
    }
  }
}
```

## Custom Components

### Buttons
```tsx
<button className="btn-tech">Primary Button</button>
<button className="btn-tech-secondary">Secondary</button>
<button className="btn-tech-accent">Accent</button>
```

### Cards
```tsx
<div className="card-tech">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```

### Gradients
```tsx
<div className="tech-gradient">
  Gradient background
</div>

<h1 className="animated-gradient-text">
  Animated gradient text
</h1>
```

### Glow Effects
```tsx
<div className="tech-glow">Static glow</div>
<div className="tech-glow-hover">Glow on hover</div>
<div className="pulse-glow">Pulsing glow</div>
```

## Development Tips

### Hot Module Replacement
Vite provides instant HMR. Just save files and see changes immediately.

### TypeScript
All files use TypeScript. Type errors will show in terminal and browser.

### Tailwind CSS
Use Tailwind utility classes. Purge removes unused styles in production.

### Component Organization
- Keep pages in `src/pages/`
- Shared components in `src/components/` (when you create them)
- Custom hooks in `src/hooks/`
- Utilities in `src/lib/`

### Path Aliases
Use `@/` to import from src:
```typescript
import { theme } from '@/theme';
import HomePage from '@/pages/HomePage';
```

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check (no emit)
npm run check
```

## Troubleshooting

### Port 3002 Already in Use
Change port in `vite.config.ts`:
```typescript
server: {
  port: 3003, // or any available port
}
```

### Module Not Found
1. Check import paths
2. Ensure dependencies installed: `npm install`
3. Restart dev server

### Tailwind Classes Not Working
1. Check `tailwind.config.ts` content paths
2. Ensure PostCSS configured
3. Restart dev server

### Build Errors
1. Run type check: `npm run check`
2. Fix TypeScript errors
3. Clear dist folder
4. Rebuild

## Next Steps

1. **Add Components**
   - Create reusable UI components
   - Build product card component
   - Add navigation component

2. **Connect Backend**
   - Set up API integration
   - Add authentication
   - Fetch real product data

3. **Add Features**
   - Shopping cart
   - Product search
   - Filters and sorting
   - User reviews

4. **Optimize**
   - Add images
   - Implement lazy loading
   - Optimize bundle size
   - Add loading states

## Resources

- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Wouter:** https://github.com/molefrog/wouter
- **Lucide Icons:** https://lucide.dev
- **Radix UI:** https://radix-ui.com

## Support

For questions about the template architecture:
- See `/MULTI_TEMPLATE_ARCHITECTURE.md`
- See `/TEMPLATE_COLOR_RESEARCH.md`
- See `/templates/TECH_GADGETS_IMPLEMENTATION.md`

---

**Template Version:** 1.0.0
**Last Updated:** January 5, 2026

Ready to build? Run `npm install` and then `npm run dev`!
