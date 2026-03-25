# Vintage Fashion Template - Build Instructions

## Quick Start

### 1. Install Dependencies

From the project root:
```bash
npm run install:template:vintage-fashion
```

Or from the template directory:
```bash
cd templates/vintage-fashion
npm install
```

### 2. Start Development Server

From the project root:
```bash
npm run dev:template:vintage-fashion
```

Or from the template directory:
```bash
cd templates/vintage-fashion
npm run dev
```

The template will be available at: http://localhost:5175

### 3. Build for Production

From the project root:
```bash
npm run build:template:vintage-fashion
```

Or from the template directory:
```bash
cd templates/vintage-fashion
npm run build
```

Build output: `/Users/jcampos/WebstormProjects/BeautyMarket/dist/templates/vintage-fashion`

## Template Structure

```
templates/vintage-fashion/
├── Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── vite.config.ts            # Vite bundler configuration
│   ├── tsconfig.json             # TypeScript compiler options
│   ├── tailwind.config.js        # Tailwind CSS theme
│   ├── postcss.config.js         # PostCSS plugins
│   ├── .gitignore                # Git ignore rules
│   └── index.html                # HTML entry point
│
├── Documentation
│   ├── README.md                 # Template overview and usage
│   ├── TEMPLATE_SUMMARY.md       # Complete implementation details
│   └── BUILD_INSTRUCTIONS.md     # This file
│
├── Public Assets
│   └── public/
│       └── favicon.svg           # Template favicon
│
└── Source Code
    └── src/
        ├── main.tsx              # React entry point
        ├── App.tsx               # Main application component
        ├── index.css             # Global styles with CSS variables
        ├── theme.ts              # Theme configuration object
        ├── vite-env.d.ts         # Vite type definitions
        └── components/           # Reusable components
            ├── index.ts
            ├── OrnateBorder.tsx
            ├── VintageDivider.tsx
            ├── VintageButton.tsx
            ├── VintageCard.tsx
            └── VintageBadge.tsx
```

## Component Overview

### OrnateBorder
Decorative borders for cards and sections.

**Props:**
- `children: ReactNode` - Content to wrap
- `className?: string` - Additional CSS classes
- `variant?: 'single' | 'double' | 'decorative'` - Border style

**Usage:**
```tsx
<OrnateBorder variant="decorative">
  <h2>Featured Collection</h2>
  <p>Timeless vintage pieces...</p>
</OrnateBorder>
```

### VintageDivider
Ornate section dividers with optional text.

**Props:**
- `text?: string` - Centered text label
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<VintageDivider text="New Arrivals" />
```

### VintageButton
Styled buttons matching vintage aesthetic.

**Props:**
- `variant?: 'primary' | 'secondary' | 'outline'` - Button style
- `size?: 'sm' | 'md' | 'lg'` - Button size
- All standard button HTML attributes

**Usage:**
```tsx
<VintageButton variant="primary" size="lg" onClick={handleClick}>
  Shop Now
</VintageButton>
```

### VintageCard
Product card with multiple sections.

**Subcomponents:**
- `VintageCard` - Main container
- `VintageCardHeader` - Header section
- `VintageCardContent` - Content section
- `VintageCardFooter` - Footer section

**Props (VintageCard):**
- `children: ReactNode`
- `className?: string`
- `hover?: boolean` - Enable hover effects
- `sepia?: boolean` - Apply sepia filter

**Usage:**
```tsx
<VintageCard hover>
  <VintageCardHeader>
    <img src="..." alt="Product" />
  </VintageCardHeader>
  <VintageCardContent>
    <h3>1950s Swing Dress</h3>
    <p>Classic A-line silhouette...</p>
  </VintageCardContent>
  <VintageCardFooter>
    <VintageButton variant="outline" size="sm">
      Add to Cart
    </VintageButton>
  </VintageCardFooter>
</VintageCard>
```

### VintageBadge
Labels and tags for products.

**Props:**
- `children: ReactNode` - Badge text
- `variant?: 'new' | 'sale' | 'bestseller' | 'vintage' | 'limited'`
- `className?: string`

**Usage:**
```tsx
<VintageBadge variant="new">New Arrival</VintageBadge>
<VintageBadge variant="sale">Sale</VintageBadge>
```

## Theme Customization

### Color Variables (src/index.css)

```css
:root {
  --primary: 338 81% 29%;           /* Burgundy #881337 */
  --secondary: 45 93% 47%;          /* Mustard #eab308 */
  --accent: 350 89% 60%;            /* Dusty Rose #f43f5e */
  --background: 48 100% 96%;        /* Warm Cream #fffbeb */
}
```

### Tailwind Color Classes (tailwind.config.js)

Direct color usage:
```tsx
<div className="bg-burgundy-900 text-cream-50">
<div className="bg-mustard-500 text-burgundy-900">
<div className="border-burgundy-900/30">
```

### Custom Utility Classes

```tsx
{/* Vintage texture overlay */}
<div className="vintage-texture">...</div>

{/* Sepia filter for photos */}
<img className="sepia" src="..." />

{/* Vintage shadows */}
<div className="shadow-vintage">...</div>
<div className="shadow-vintage-lg">...</div>

{/* Ornate borders */}
<div className="border-vintage">...</div>
<div className="border-vintage-ornate">...</div>

{/* Ornate divider */}
<div className="ornate-divider">
  <span>Section Title</span>
</div>

{/* Pre-styled buttons */}
<button className="btn-vintage-primary">Button</button>
<button className="btn-vintage-secondary">Button</button>
<button className="btn-vintage-outline">Button</button>
```

## Typography

### Font Loading

Fonts are loaded from Google Fonts CDN in `index.html`:
- **Playfair Display** - Elegant serif for headings
- **Lora** - Classic serif for body text

### Font Classes

```tsx
{/* Serif heading font */}
<h1 className="font-serif">Vintage Fashion Co.</h1>

{/* Serif body font */}
<p className="font-body">Classic vintage clothing...</p>

{/* Sans-serif fallback */}
<span className="font-sans">Modern text</span>
```

## Build Configuration

### Vite Config (vite.config.ts)

- **Output directory**: `../../dist/templates/vintage-fashion`
- **Dev server port**: 5175
- **Code splitting**: Vendor chunks for React, Router, UI components
- **Path alias**: `@/` → `src/`

### Build Optimization

The build process includes:
- ✅ Tree-shaking unused code
- ✅ Minification (JavaScript + CSS)
- ✅ Vendor code splitting
- ✅ Asset optimization
- ✅ Source maps (development only)

### Build Output

```
dist/templates/vintage-fashion/
├── index.html
├── assets/
│   ├── index-[hash].js          # Main application code
│   ├── index-[hash].css         # Compiled Tailwind CSS
│   ├── vendor-react-[hash].js   # React + ReactDOM
│   ├── vendor-router-[hash].js  # Wouter
│   ├── vendor-ui-[hash].js      # Radix UI components
│   └── vendor-utils-[hash].js   # Utility libraries
└── favicon.svg
```

## Testing the Build

### 1. Build the template
```bash
npm run build:template:vintage-fashion
```

### 2. Verify output directory
```bash
ls -la dist/templates/vintage-fashion
```

Expected files:
- index.html
- assets/ directory with JS and CSS bundles
- favicon.svg

### 3. Preview the build locally
```bash
cd templates/vintage-fashion
npm run preview
```

Access at: http://localhost:4173

### 4. Check bundle sizes
```bash
du -sh dist/templates/vintage-fashion/assets/*
```

Typical sizes:
- Main JS: ~150KB (gzipped)
- Vendor chunks: ~200KB total (gzipped)
- CSS: ~20KB (gzipped)

## Deployment

### Local S3 Deployment

Update `setup-template-bucket.js`:

```javascript
const TEMPLATE_BUILD_PATHS = {
  'vintage-fashion-example': './dist/templates/vintage-fashion',
};
```

Run deployment:
```bash
npm run build:template:vintage-fashion
node setup-template-bucket.js
```

### Live URL
After deployment, template will be available at:
**https://vintage-fashion-example.j-markets.jcampos.dev**

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module '@/components'`
**Solution**: Check that `tsconfig.json` has correct path mapping and restart dev server

**Issue**: Tailwind classes not applying
**Solution**: Verify `tailwind.config.js` content paths include all template files

**Issue**: Build output in wrong directory
**Solution**: Check `vite.config.ts` outDir path is correct

**Issue**: Fonts not loading
**Solution**: Verify Google Fonts link in `index.html` is correct

### Development Tips

1. **Hot Module Replacement**: Vite supports HMR - changes appear instantly
2. **CSS Variables**: Use HSL format for easy color manipulation
3. **Component Isolation**: Test components individually before using in layouts
4. **Responsive Design**: Use Tailwind responsive prefixes (sm:, md:, lg:, xl:)
5. **Accessibility**: Ensure color contrast meets WCAG AA standards

## Next Steps

1. ✅ Template structure created
2. ✅ All components implemented
3. ✅ Theme configuration complete
4. ✅ Build scripts added to root package.json
5. ⏳ Install dependencies (`npm run install:template:vintage-fashion`)
6. ⏳ Test local development (`npm run dev:template:vintage-fashion`)
7. ⏳ Build for production (`npm run build:template:vintage-fashion`)
8. ⏳ Deploy to S3/CloudFront
9. ⏳ Verify live at https://vintage-fashion-example.j-markets.jcampos.dev

## Support

For issues or questions:
- Check TEMPLATE_SUMMARY.md for implementation details
- Review MULTI_TEMPLATE_ARCHITECTURE.md for overall architecture
- Check TEMPLATE_COLOR_RESEARCH.md for design specifications
