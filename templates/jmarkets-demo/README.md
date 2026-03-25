# JMarkets Demo Template

A modern, general marketplace template with an orange and blue color scheme.

## Theme Specifications

- **Primary Color**: Orange `#f97316`
- **Secondary Color**: Blue `#1e40af`
- **Accent Color**: Amber `#fbbf24`
- **Font**: Inter (modern, clean)
- **Style**: Modern e-commerce, card-heavy layout
- **Aesthetic**: Minimal, accessible, high-conversion

## Features

- Modern, responsive design
- Product catalog with filtering
- Product detail pages
- Shopping cart functionality (UI ready)
- Orange/Blue gradient hero sections
- Clean card-based layouts
- Optimized for conversion

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Output

Builds to: `dist/templates/jmarkets-demo/`

## Deployment

This template is designed to be deployed to:
- **Live URL**: https://jmarkets-demo-example.j-markets.jcampos.dev
- **S3 Bucket**: jmarkets-demo-example
- **CloudFront**: With wildcard SSL certificate

## Architecture

Built with:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Wouter (routing)
- Lucide React (icons)

## Pages

- `/` - Home page with hero, features, and featured products
- `/products` - Product catalog with filters and search
- `/products/:id` - Product detail page

## Customization

Theme colors are defined in:
- `tailwind.config.js` - Tailwind color scales
- `src/index.css` - CSS variables and utilities

To customize the theme, update the color values in these files.
