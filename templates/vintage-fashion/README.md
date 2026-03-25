# Vintage Fashion Template

A vintage-inspired e-commerce template with burgundy and mustard color scheme, featuring elegant serif typography and nostalgic design elements.

## Theme Specifications

### Color Palette
- **Primary**: Burgundy `#881337` - Luxury, nostalgia, timeless elegance
- **Secondary**: Mustard `#eab308` - Retro 60s-70s vibe, warm and inviting
- **Accent**: Dusty Rose `#f43f5e` - Romantic, feminine, soft
- **Background**: Warm Cream `#fffbeb` - Vintage paper aesthetic

### Typography
- **Headings**: Playfair Display (elegant serif)
- **Body**: Lora (classic readable serif)
- **Fallback**: Inter (sans-serif)

### Design Elements
- Ornate borders with decorative corners
- Sepia filters for vintage photography
- Vintage texture overlays
- Classic card designs with shadows
- Handwritten-style accents

## Project Structure

```
vintage-fashion/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # Vintage-styled navigation
│   │   │   └── Footer.tsx         # Ornate footer with vintage elements
│   │   ├── OrnateBorder.tsx       # Decorative borders (single/double/decorative)
│   │   ├── VintageDivider.tsx     # Section dividers with optional text
│   │   ├── VintageButton.tsx      # Styled buttons (primary/secondary/outline)
│   │   ├── VintageCard.tsx        # Product cards with vintage aesthetic
│   │   ├── VintageBadge.tsx       # Labels (new/sale/bestseller/vintage/limited)
│   │   └── index.ts               # Component barrel exports
│   ├── pages/
│   │   ├── HomePage.tsx           # Hero, featured products, about section
│   │   ├── ProductsPage.tsx       # Product listing with filters
│   │   ├── ProductDetailPage.tsx  # Product details with ornate styling
│   │   ├── CartPage.tsx           # Shopping cart
│   │   ├── NotFoundPage.tsx       # 404 error page
│   │   └── index.ts               # Page barrel exports
│   ├── App.tsx                    # Main app with routing
│   ├── main.tsx                   # Entry point
│   ├── theme.ts                   # Theme configuration
│   └── index.css                  # Global styles and utilities
├── index.html
├── tailwind.config.js
├── vite.config.ts
├── package.json
└── README.md
```

## Features

### Pages
- **HomePage**: Hero section with vintage aesthetic, featured products grid, features showcase, about section
- **ProductsPage**: Product catalog with category filters, sorting, responsive grid
- **ProductDetailPage**: Detailed product view with size selection, quantity controls, related products
- **CartPage**: Shopping cart with quantity management, order summary, progress to free shipping
- **NotFoundPage**: Elegant 404 error page with helpful navigation

### Layout Components
- **Navbar**: Sticky navigation with mobile menu, cart indicator, search icon
- **Footer**: Newsletter signup, navigation links, contact info, social media, trust badges

### Custom Components
All components use the vintage aesthetic with:
- Serif fonts (Playfair Display for headings)
- Burgundy and mustard color scheme
- Ornate decorative elements
- Vintage shadows and borders

## Development

```bash
# Install dependencies
npm install

# Start development server (port 5175)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Output

Builds to: `../../dist/templates/vintage-fashion`

## Live Demo

URL: https://vintage-fashion-example.j-markets.jcampos.dev

## Components

### Vintage-Specific Components

**OrnateBorder**
- Variants: `single`, `double`, `decorative`
- Decorative variant includes corner ornaments

**VintageDivider**
- Section divider with gradient line
- Optional centered text

**VintageButton**
- Variants: `primary` (burgundy), `secondary` (mustard), `outline`
- Sizes: `sm`, `md`, `lg`

**VintageCard**
- Card components: `VintageCard`, `VintageCardHeader`, `VintageCardContent`, `VintageCardFooter`
- Optional hover effect and sepia filter

**VintageBadge**
- Variants: `new`, `sale`, `bestseller`, `vintage`, `limited`
- Uppercase tracking with borders

### Usage Example

```tsx
import {
  VintageButton,
  OrnateBorder,
  VintageBadge,
  VintageCard,
  VintageCardContent,
} from './components';

<VintageCard hover>
  <VintageCardContent>
    <OrnateBorder variant="decorative">
      <h2>Featured Collection</h2>
      <VintageBadge variant="new">New Arrival</VintageBadge>
      <VintageButton variant="primary" size="lg">
        Shop Now
      </VintageButton>
    </OrnateBorder>
  </VintageCardContent>
</VintageCard>
```

## Routing

Uses Wouter for client-side routing:
- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product detail
- `/cart` - Shopping cart
- `*` - 404 Not Found

## Theme Customization

See `src/theme.ts` for complete theme configuration including:
- Color tokens (primary, secondary, accent, neutrals)
- Typography settings (fonts, sizes, weights, line heights)
- Spacing scale
- Border radius
- Shadow definitions (vintage, vintageLg, vintageXl)
- Vintage-specific effects (sepia, warm filter, texture)
- Breakpoints
- Z-index scale

## CSS Variables

Defined in `src/index.css`:
- HSL color system for easy theming
- Dark mode support (optional)
- Vintage texture overlay
- Ornate divider styles
- Shadow utilities
- Border utilities

## License

MIT
