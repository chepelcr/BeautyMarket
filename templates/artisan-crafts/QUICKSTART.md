# Artisan Crafts Template - Quick Start Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd templates/artisan-crafts
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Visit: http://localhost:5175

### 3. Build for Production
```bash
npm run build
```
Output: `../../dist/templates/artisan-crafts/`

### 4. Preview Production Build
```bash
npm run preview
```

## 📁 File Structure

```
artisan-crafts/
├── src/
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   ├── index.css         # Styles + Tailwind
│   └── theme.ts          # Theme config
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.ts        # Build config
├── tailwind.config.js    # Theme colors
└── README.md             # Full docs
```

## 🎨 Theme Colors

```css
Primary:   #ea580c  /* Terracotta */
Secondary: #15803d  /* Forest Green */
Accent:    #ca8a04  /* Golden Yellow */
Background: #fffbeb /* Natural Canvas */
```

## 🔧 Key Components

### Buttons
- `.btn-artisan` - Primary button
- `.btn-artisan-secondary` - Secondary button
- `.btn-artisan-outline` - Outline button

### Cards
- `.card-artisan` - Product/feature card
- `.badge-artisan` - Artisan badge
- `.badge-sale` - Sale badge

### Layout
- `.container-organic` - Responsive container
- `.section-textured` - Textured section
- `.product-grid` - Product grid

## 📝 Customization

### Change Colors
Edit `tailwind.config.js`:
```js
primary: { DEFAULT: '#ea580c' }
```

### Change Fonts
Edit `index.html` (Google Fonts) and `tailwind.config.js`:
```js
fontFamily: {
  sans: ['Josefin Sans', 'sans-serif'],
  serif: ['Merriweather', 'serif'],
}
```

### Modify Components
Edit `src/index.css` in the `@layer components` section.

## 🌐 Deployment

### Build Output
```bash
npm run build
# Output: dist/templates/artisan-crafts/
```

### Deploy to S3 + CloudFront
Use the existing deployment script:
```bash
# From project root
./build-artisan-crafts.sh
node setup-template-bucket.js
```

### Live URL
https://artisan-crafts-example.j-markets.jcampos.dev

## 📚 Documentation

- **README.md** - Full documentation
- **IMPLEMENTATION.md** - Implementation details
- **QUICKSTART.md** - This file

## 🎯 Features

✅ Terracotta/Green/Yellow earth tones
✅ Merriweather + Josefin Sans fonts
✅ Organic rounded corners
✅ Hand-drawn style effects
✅ Natural textures
✅ Responsive design (1/2/3 columns)
✅ WCAG AA accessible
✅ Optimized build

## 🐛 Troubleshooting

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port already in use
Change port in `vite.config.ts`:
```ts
server: { port: 5176 }
```

### TypeScript errors
```bash
npm run build --skipLibCheck
```

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Dev server runs
- [ ] Build succeeds
- [ ] Output verified
- [ ] Preview works
- [ ] Ready to deploy

---

**Need help?** See README.md for full documentation.
