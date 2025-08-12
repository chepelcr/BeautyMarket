# 🍓 Strawberry Essentials - GitHub Pages Deployment

This is a beauty products marketplace built with React, TypeScript, and Vite. The application has been configured to work as a static site on GitHub Pages while maintaining full functionality through client-side data management.

## 🚀 Quick Deploy to GitHub Pages

### Option 1: Automatic Deploy (Recommended)
1. Fork/clone this repository to your GitHub account
2. Go to your repository settings → Pages
3. Select "GitHub Actions" as the source
4. Push any changes to the `main` branch - the site will automatically build and deploy

### Option 2: Manual Deploy
1. Build the static site:
   ```bash
   node deploy-github-pages.js your-repo-name
   ```
2. The build files will be in `dist/public`
3. Deploy manually using `gh-pages` or upload to your hosting provider

## 🏗️ How It Works

The application automatically detects when it's running on GitHub Pages and switches to **static mode**:

- **Dynamic Mode** (Development): Uses Express.js backend with PostgreSQL database
- **Static Mode** (GitHub Pages): Uses localStorage and mock data for full functionality

### Static Mode Features
- ✅ Product catalog with categories (Maquillaje, Skincare, Accesorios)
- ✅ Shopping cart with persistent storage
- ✅ WhatsApp checkout integration
- ✅ Admin panel with local authentication (username: admin, password: admin123)
- ✅ Costa Rica location system
- ✅ Responsive design with mobile support
- ✅ SEO optimization

## 🛍️ Features

### For Customers
- Browse products by category
- Add items to cart with quantity selection
- Checkout via WhatsApp with order details
- Costa Rica location selector (provincia, cantón, distrito)
- Multiple delivery options (Correos, Uber Flash, Personal Delivery)

### For Admins
- Secure login system
- Product management (add, edit, delete)
- Order tracking
- Real-time inventory management

## 🎨 Design

- **Brand Colors**: Pink primary with coral accents
- **Typography**: Modern serif for headings, clean sans-serif for content
- **Layout**: Mobile-first responsive design
- **Icons**: Lucide React with Font Awesome fallbacks

## 🔧 Configuration

### Custom Domain (Optional)
Uncomment and modify the CNAME creation in `deploy-github-pages.js`:
```javascript
fs.writeFileSync(path.join(buildDir, 'CNAME'), 'your-domain.com');
```

### Contact Information
Update in `client/src/components/layout/footer.tsx`:
- Instagram: @strawberry.essentials
- Phone: 73676745
- WhatsApp integration for orders

### Adding Products
In static mode, products are stored in localStorage. Default sample products are included, and admins can add more through the admin panel.

## 📱 Mobile Experience

The site is fully optimized for mobile devices with:
- Touch-friendly navigation
- Mobile-optimized cart interface  
- Responsive product galleries
- Mobile WhatsApp integration

## 🔍 SEO Features

- Semantic HTML structure
- Meta descriptions and Open Graph tags
- Fast loading with Vite optimization
- Mobile-friendly design

## 🛠️ Development

To run locally:
```bash
npm install
npm run dev
```

To build for production:
```bash
npm run build:static
```

## 📞 Support

For any issues with deployment or customization, the application includes comprehensive error handling and user-friendly messages.

---

**Live Demo**: `https://[your-username].github.io/[your-repo-name]`

Built with ❤️ for Strawberry Essentials