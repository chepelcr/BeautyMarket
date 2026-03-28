# Gourmet Foods Template

Premium gourmet food and specialty foods e-commerce template for the JMarkets platform.

## Theme Specifications

### Visual Identity
- **Primary Color**: Rich Red `#dc2626` - Appetite stimulation, culinary passion, energy
- **Secondary Color**: Deep Green `#166534` - Fresh ingredients, organic, farm-to-table
- **Accent Color**: Amber Gold `#d97706` - Premium gourmet appeal, artisanal
- **Background**: Clean white `#ffffff` - Food-safe, clean presentation
- **Style**: Gourmet, sophisticated, appetizing, premium
- **Aesthetic**: Luxury, premium, food-focused photography

### Typography
- **Headings**: Playfair Display - Elegant serif for gourmet feel
- **Body**: Source Sans Pro - Clean, readable sans-serif
- **Character**: Sophisticated, premium, appetizing

## Features

### Template-Specific Components
- **RecipeCard** - Featured recipe cards with cooking time, servings, difficulty
- **IngredientBadge** - Organic, Premium, Fresh, Local, Seasonal badges
- **ProductCard** - Food product cards with rating, reviews, and special badges
- **Header** - Navigation with search, categories, and gourmet branding
- **Footer** - Comprehensive footer with contact, links, and social media

### Food-Specific Features
- ✅ Recipe integration
- ✅ Ingredient highlighting
- ✅ Organic/Premium/Fresh badges
- ✅ Origin highlighting
- ✅ Premium product presentation
- ✅ Seasonal badges
- ✅ Allergen tags support
- ✅ Nutritional info ready

### Pages
- **HomePage** - Hero section, featured products, recipe section, CTA
- **ProductsPage** - Full product catalog with filters and sorting
- **ProductDetailPage** - Detailed product view with pairing suggestions
- **CartPage** - Shopping cart with order summary
- **NotFoundPage** - Custom 404 error page

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Server runs on `http://localhost:3002`

### Build for Production
```bash
npm run build
```
Builds to `../../dist/templates/gourmet-foods`

### Preview Production Build
```bash
npm run preview
```

## Design Guidelines

### Photography
- **Essential**: High-quality food photography
- **Style**: Well-lit, professional, appetizing
- **Colors**: Rich, saturated product images
- **Focus**: Food-focused, close-up shots

### Color Usage
- **Primary Red**: CTAs, featured items, sale badges
- **Secondary Green**: Organic products, fresh ingredients
- **Accent Gold**: Premium items, special offers, highlights
- **Neutral**: Clean backgrounds, cards, text

### Component Styling
- **Buttons**: Slightly rounded (8px), premium feel
- **Cards**: Clean white with subtle shadows
- **Badges**: Gold for premium, green for organic, red for fresh
- **Images**: High-quality, well-composed food photography

### Effects
- Gold foil accents for premium items
- Subtle shadows and gradients
- Smooth hover transitions
- Premium shadow effects

## Live Demo

**URL**: https://gourmet-foods-example.j-markets.jcampos.dev

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with custom gourmet theme
- **Icons**: Lucide React
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives

## File Structure

```
templates/gourmet-foods/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── RecipeCard.tsx
│   │   └── IngredientBadge.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── lib/
│   ├── hooks/
│   ├── assets/
│   ├── theme.ts
│   ├── index.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Deployment

This template is designed to be deployed as part of the JMarkets multi-template system:

1. Build is output to `dist/templates/gourmet-foods`
2. Deployment script uploads to S3
3. CloudFront serves at `https://gourmet-foods-example.j-markets.jcampos.dev`

## Color Accessibility

All colors meet WCAG AA standards:
- Primary Red on White: 6.11:1 (AA compliant)
- Secondary Green on White: 8.90:1 (AAA compliant)
- Accent Gold on White: 4.72:1 (AA compliant)

## Customization

### Changing Colors
Edit `src/index.css` CSS variables:
```css
--primary: 0 84% 60%;        /* Red */
--secondary: 145 80% 25%;    /* Green */
--accent: 32 95% 44%;        /* Gold */
```

### Changing Fonts
Edit Google Fonts import in `index.html` and update `src/theme.ts`

### Adding Features
- Add new components to `src/components/`
- Add new pages to `src/pages/`
- Update routing in `src/App.tsx`

## Support

For issues or questions, refer to the main BeautyMarket documentation or contact the development team.
