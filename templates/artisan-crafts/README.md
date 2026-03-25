# Artisan Crafts Template

> Handmade Crafts & Artisanal Goods E-commerce Template

## Overview

The Artisan Crafts template is designed for businesses selling handmade, artisanal, and craft products. It features warm earth tones, organic shapes, and a rustic aesthetic that emphasizes the handcrafted nature of the products.

## Theme Specifications

### Visual Identity
- **Primary Color**: Terracotta `#ea580c` (Orange-600)
- **Secondary Color**: Forest Green `#15803d` (Green-700)
- **Accent Color**: Golden Yellow `#ca8a04` (Yellow-600)
- **Background**: Natural canvas `#fffbeb` (Amber-50)
- **Text**: Warm black `#292524` (Stone-800)

### Typography
- **Headings**: Josefin Sans (handcrafted, friendly feel)
- **Body**: Merriweather (elegant, readable serif)

### Design Elements
- Rounded corners (organic feel)
- Hand-drawn style decorations
- Natural textures (paper, canvas)
- Soft shadows
- Smooth transitions
- Subtle animations (float, wiggle)

## Features

### Layout
- Sticky navigation with transparent background
- Hero section with warm gradient overlay
- Product grid (1/2/3 columns responsive)
- Feature cards with icons
- Call-to-action sections
- Comprehensive footer

### Components
- Artisan-style buttons (primary, secondary, outline)
- Organic cards with hover effects
- Handcrafted badges (new, sale, artisan)
- Textured sections
- Hand-drawn underline effects
- Product cards with sale badges

### Animations
- Float animation for decorative elements
- Wiggle animation for accent icons
- Hover scale effects
- Smooth transitions
- Card lift on hover

## Build Instructions

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
# Runs on http://localhost:5175
```

### Build for Production
```bash
npm run build
# Output: ../../dist/templates/artisan-crafts
```

### Preview Production Build
```bash
npm run preview
```

## File Structure

```
artisan-crafts/
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles and custom classes
│   └── theme.ts          # Theme configuration
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind theme customization
├── tsconfig.json         # TypeScript configuration
└── postcss.config.js     # PostCSS configuration
```

## Theme Configuration

The `theme.ts` file contains comprehensive theme configuration:

- Color palette (primary, secondary, accent, backgrounds, text)
- Typography settings (fonts, sizes, weights)
- Spacing and layout preferences
- Component styles (buttons, cards, inputs)
- Design elements (decorative, textures, effects)
- Layout preferences (grid, hero, navigation)
- Product display settings

## Customization

### Changing Colors
Edit `tailwind.config.js` to modify the color palette:

```js
colors: {
  primary: {
    DEFAULT: '#ea580c',  // Your primary color
    // ...
  },
}
```

### Changing Fonts
Update the Google Fonts link in `index.html` and the `fontFamily` in `tailwind.config.js`.

### Modifying Components
All component styles are in `src/index.css` using Tailwind's `@layer components` directive.

## Live Demo

**URL**: https://artisan-crafts-example.j-markets.jcampos.dev

## Target Audience

- Handmade crafts stores
- Artisan marketplaces
- DIY product sellers
- Pottery and ceramics shops
- Textile and fabric stores
- Jewelry makers
- Craft supply stores
- Sustainable/eco-friendly product sellers

## Unique Selling Points

1. **Organic Design**: Rounded corners and natural shapes
2. **Warm Color Palette**: Earth tones that feel authentic
3. **Textured Backgrounds**: Paper and canvas textures
4. **Handcrafted Feel**: Typography and design elements
5. **Sustainability Focus**: Green accents and eco messaging
6. **Artisan Stories**: Emphasizes maker stories

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Code splitting for vendor libraries
- Optimized bundle size
- Lazy loading ready
- Tree-shaking enabled
- Minified CSS and JS

## Accessibility

- WCAG AA compliant color contrasts
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- Focus indicators

## License

MIT License - Part of the JMarkets template collection

## Version

1.0.0

---

**Created**: January 5, 2026
**Template Category**: Handmade Crafts & Artisanal Goods
**Build Status**: Ready for deployment
