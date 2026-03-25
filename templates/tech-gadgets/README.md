# Tech Gadgets Template

A sleek, futuristic e-commerce template designed for technology and electronics stores.

## Visual Identity

- **Primary Color:** Dark Blue #1e3a8a (trust, innovation, technology)
- **Secondary Color:** Cyan #06b6d4 (modern, cutting-edge, digital)
- **Accent Color:** Electric Blue #3b82f6 (vibrant, tech-forward)
- **Background:** Dark mode by default (Slate-900 #0f172a)
- **Font:** Roboto (geometric, tech-friendly)
- **Style:** Sleek, futuristic, high-contrast, minimal

## Features

- Dark mode by default (tech aesthetic)
- Sharp, minimal borders for modern look
- Tech-inspired iconography
- High contrast for excellent readability
- Futuristic animations and effects
- Product specification displays
- Gradient text effects
- Glow effects on interactive elements
- Grid patterns and scanline effects

## Development

```bash
# Install dependencies
npm install

# Start development server (port 3002)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Output

Builds to: `../../dist/templates/tech-gadgets`

## Template Pages

- **Home Page**: Hero section with categories and featured products
- **Products Page**: Full product listing with filters and grid/list view
- **Product Detail**: Comprehensive product page with specs, images, and related products
- **Cart Page**: Shopping cart with quantity controls, promo codes, and order summary
- **404 Page**: Custom not found page with tech aesthetic

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Wouter (routing)
- Lucide React (icons)

## Components

### Layout Components
- **Navbar**: Responsive navigation with cart, search, mobile menu, and glow effects
- **Footer**: Multi-column footer with newsletter signup and social links

### UI Components
- **ProductCard**: Tech-themed product card with hover glow effects and quick add to cart
- **TechBadge**: Customizable badge component with variants (new, bestseller, sale, limited, etc.)

## Theme Customization

All theme colors and settings are defined in:
- `src/theme.ts` - TypeScript theme configuration
- `src/index.css` - CSS custom properties and utility classes
- `tailwind.config.ts` - Tailwind theme extension

### Custom CSS Classes
- `.tech-gradient` - Blue to cyan gradient background
- `.tech-glow` - Cyan glow effect
- `.tech-glow-hover` - Glow effect on hover
- `.animated-gradient-text` - Animated gradient text
- `.grid-pattern` - Subtle grid background
- `.scanlines` - CRT scanline overlay effect
- `.btn-tech`, `.btn-tech-secondary`, `.btn-tech-accent` - Tech-styled buttons
- `.card-tech` - Tech-styled card with hover effects

## Live Demo

**URL:** https://tech-gadgets-example.j-markets.jcampos.dev

## License

Part of the BeautyMarket multi-template system.
