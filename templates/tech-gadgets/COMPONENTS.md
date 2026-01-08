# Tech Gadgets Template - Component Documentation

Complete reference for all components, pages, and utilities in the Tech Gadgets template.

## Table of Contents

- [Layout Components](#layout-components)
- [UI Components](#ui-components)
- [Pages](#pages)
- [Custom CSS Classes](#custom-css-classes)
- [Theme Configuration](#theme-configuration)

---

## Layout Components

### Navbar

Modern tech-style navigation bar with responsive design and interactive features.

**Location**: `src/components/layout/Navbar.tsx`

**Features**:
- Sticky positioning with backdrop blur
- Animated logo with glow effect on hover
- Responsive mobile menu
- Search functionality (expandable)
- Shopping cart with item count badge
- User account link
- Desktop and mobile layouts

**Props**:
```typescript
interface NavbarProps {
  cartItemCount?: number; // Number of items in cart (for badge)
}
```

**Usage**:
```tsx
import Navbar from './components/layout/Navbar';

<Navbar cartItemCount={3} />
```

**Navigation Links**:
- Home (logo)
- Products
- Categories
- Deals
- About
- Account (user icon)
- Cart (with count badge)

---

### Footer

Comprehensive footer with multiple sections and newsletter signup.

**Location**: `src/components/layout/Footer.tsx`

**Features**:
- Brand section with logo and social links (GitHub, Twitter, LinkedIn)
- Multi-column navigation (Shop, Support, Contact)
- Newsletter subscription form
- Contact information (address, phone, email)
- Legal links (Privacy, Terms, Cookies)
- Decorative gradient accent bar
- Responsive grid layout

**Props**: None (stateless component)

**Usage**:
```tsx
import Footer from './components/layout/Footer';

<Footer />
```

**Social Links**: Configurable links to social media platforms with hover glow effects

---

## UI Components

### ProductCard

Tech-themed product card with hover effects and interactive elements.

**Location**: `src/components/ProductCard.tsx`

**Features**:
- Animated border glow on hover
- Product image or icon placeholder
- Badge support (New, Sale, etc.)
- Star rating display
- Price with currency formatting
- Quick add to cart button (appears on hover)
- Tech corner accent (decorative)
- Fully responsive

**Props**:
```typescript
interface ProductCardProps {
  id: string;              // Product ID
  name: string;            // Product name
  description: string;     // Short description
  price: number;           // Price (number, formatted as currency)
  image?: string;          // Optional product image URL
  badge?: string;          // Optional badge text (e.g., "New", "Sale")
  rating?: number;         // Optional rating (0-5)
  onAddToCart?: (productId: string) => void; // Add to cart callback
}
```

**Usage**:
```tsx
import ProductCard from './components/ProductCard';

<ProductCard
  id="1"
  name="UltraBook Pro X1"
  description="16\" 4K Display, M2 Chip, 32GB RAM"
  price={2499}
  badge="New"
  rating={4.9}
  onAddToCart={(id) => handleAddToCart(id)}
/>
```

**Hover Effects**:
- Animated cyan border glow
- Background color shift
- Image/icon scale and opacity change
- Quick add button appears
- Price glow effect

---

### TechBadge

Customizable badge component with multiple variants and effects.

**Location**: `src/components/TechBadge.tsx`

**Variants**:
- `new` - Blue accent (new products)
- `bestseller` - Cyan (popular items)
- `sale` - Red destructive (sale items)
- `limited` - Electric blue (limited edition)
- `featured` - Bright cyan (featured products)
- `popular` - Dark blue (popular items)
- `default` - Neutral card color

**Props**:
```typescript
interface TechBadgeProps {
  label: string;           // Badge text
  variant?: BadgeVariant;  // Color variant
  icon?: LucideIcon;       // Optional icon component
  glow?: boolean;          // Enable glow effect
  pulse?: boolean;         // Enable pulse animation
  className?: string;      // Additional CSS classes
}
```

**Usage**:
```tsx
import TechBadge, { NewBadge, SaleBadge } from './components/TechBadge';

// Custom badge
<TechBadge
  label="Limited Edition"
  variant="limited"
  glow
  icon={Zap}
/>

// Preset components
<NewBadge />
<SaleBadge pulse />
<BestsellerBadge glow={false} />
```

**Preset Components**:
- `<NewBadge />` - "New" with blue accent
- `<BestsellerBadge />` - "Bestseller" with cyan
- `<SaleBadge />` - "Sale" with red and pulse
- `<LimitedBadge />` - "Limited" with electric blue
- `<FeaturedBadge />` - "Featured" with bright cyan
- `<PopularBadge />` - "Popular" with dark blue

---

## Pages

### HomePage

Landing page with hero section, categories, and featured products.

**Location**: `src/pages/HomePage.tsx`

**Sections**:
1. **Hero Section**: Full-width hero with animated gradient text, CTAs, decorative gradients
2. **Categories Grid**: 6 categories with icons (Smartphones, Laptops, Audio, Wearables, Computing, Smart Home)
3. **Featured Products**: 4-column product grid
4. **Guarantee Banner**: Full-width gradient banner with CTA

**Features**:
- Grid pattern background
- Scanline overlay effect
- Animated gradient text
- Category icons from Lucide React
- Hover effects on all interactive elements

---

### ProductsPage

Product catalog with filters, sorting, and pagination.

**Location**: `src/pages/ProductsPage.tsx`

**Features**:
- **Sidebar Filters**: Category, price range, brand filters
- **Toolbar**: Product count, sort dropdown, grid/list view toggle
- **Product Grid**: 3-column responsive grid
- **Pagination**: Page number navigation
- **Filter Statistics**: Shows number of filtered results

**Filter Options**:
- Categories (checkbox filters)
- Price ranges (checkbox filters)
- Brands (checkbox filters)
- Sort options (dropdown)

---

### ProductDetailPage

Detailed product view with specifications and related products.

**Location**: `src/pages/ProductDetailPage.tsx`

**Sections**:
1. **Breadcrumb**: Navigation trail
2. **Product Images**: Main image + thumbnail gallery
3. **Product Info**: Name, rating, price, description
4. **Key Specifications**: Bullet list with checkmarks
5. **Options**: Color and storage selection
6. **Actions**: Add to cart, wishlist, share buttons
7. **Guarantees**: Free shipping, warranty, returns icons
8. **Technical Specs Table**: Detailed specification table
9. **Related Products**: 4 related product recommendations

**Features**:
- Image gallery with thumbnails
- Color and storage variant selection
- Add to cart with quantity
- Tech spec table with hover effects
- Product guarantees display

---

### CartPage

Shopping cart with checkout functionality.

**Location**: `src/pages/CartPage.tsx`

**Features**:
- **Empty State**: Message with "Start Shopping" CTA
- **Cart Items**: Product cards with quantity controls
- **Quantity Controls**: Plus/minus buttons
- **Remove Items**: Trash icon button
- **Promo Code**: Input field with apply button
- **Order Summary**: Subtotal, discount, shipping, tax breakdown
- **Total Calculation**: Real-time price updates
- **Free Shipping Notice**: Progress indicator for free shipping threshold
- **Checkout Button**: Prominent CTA with glow effect

**Cart Item Display**:
- Product thumbnail
- Name (linked to product page)
- Description
- Unit price
- Quantity controls
- Item total
- Remove button

**Price Breakdown**:
- Subtotal
- Discount (if promo applied)
- Shipping (free over $1000)
- Tax (8%)
- Total

---

### NotFoundPage (404)

Custom 404 error page with tech aesthetic.

**Location**: `src/pages/NotFoundPage.tsx`

**Features**:
- Large animated "404" text
- Error icon with glow effect
- Helpful error message
- Error details card
- Action buttons (Go Home, Go Back, Browse Products)
- Support contact link
- Grid pattern and scanline effects
- Animated decorative elements

**Actions**:
- Navigate to home page
- Go back to previous page
- Browse products
- Contact support

---

## Custom CSS Classes

### Gradients

**`.tech-gradient`**
- Blue to cyan gradient (135deg)
- Use for backgrounds, CTAs, accent sections
```css
background: linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%);
```

**`.tech-gradient-subtle`**
- Subtle dark gradient for cards
```css
background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
```

**`.animated-gradient-text`**
- Animated gradient text effect
- Automatically animates across the gradient
- Use for headers and emphasis

---

### Glow Effects

**`.tech-glow`**
- Static cyan glow shadow
```css
box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
```

**`.tech-glow-hover`**
- Glow effect that appears on hover
- Smooth transition

**`.pulse-glow`**
- Pulsing glow animation
- Use for badges, notifications

---

### Background Patterns

**`.grid-pattern`**
- Subtle grid background
- 40px grid spacing
- Semi-transparent lines

**`.scanlines`**
- CRT scanline overlay effect
- Subtle tech aesthetic
- 4px line spacing

---

### Buttons

**`.btn-tech`**
- Primary button (dark blue)
- Hover effects and shadow

**`.btn-tech-secondary`**
- Secondary button (cyan)
- High contrast on dark backgrounds

**`.btn-tech-accent`**
- Accent button (electric blue)
- Includes hover glow effect

All buttons include:
- Rounded corners (sharp, minimal)
- Font weight medium
- Smooth transitions (300ms)
- Hover shadow

---

### Cards & Containers

**`.card-tech`**
- Tech-styled card component
- Border with hover effects
- Transitions to cyan border on hover
- Elevated shadow on hover

**`.container-tech`**
- Responsive container
- Max-width: 1280px
- Horizontal padding (responsive)

**`.section-header-tech`**
- Large gradient text header
- Multi-color gradient (blue → electric → cyan)
- Responsive font sizing (3xl → 4xl)

---

### Tables

**`.spec-table`**
- Technical specification table
- Bordered cells
- Hover row highlighting
- Styled header row

Usage:
```html
<table class="spec-table">
  <thead>
    <tr>
      <th>Specification</th>
      <th>Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Display</td>
      <td>16" 4K</td>
    </tr>
  </tbody>
</table>
```

---

### Utilities

**`.text-tech-shadow`**
- Text shadow with cyan glow
- Use for hero headers

**`.backdrop-tech`**
- Backdrop blur effect
- Semi-transparent background
- Use for navbar, modals

---

## Theme Configuration

### CSS Variables (index.css)

Located in `src/index.css` under `:root`

**Colors (HSL format)**:
```css
--background: 222.47 47.37% 11.18%;     /* Slate-900 */
--foreground: 210 40% 96.08%;           /* Slate-100 */
--card: 215.29 24.62% 26.47%;           /* Slate-700 */
--primary: 221.21 83.19% 53.33%;        /* Blue-900 */
--secondary: 187.85 84.62% 43.14%;      /* Cyan-500 */
--accent: 217.24 91.22% 59.8%;          /* Blue-500 */
--tech-cyan: 187.85 84.62% 43.14%;      /* Cyan-500 */
--tech-electric: 217.24 91.22% 59.8%;   /* Blue-500 */
```

**Border Radius**:
```css
--radius: 0.25rem; /* Sharp, minimal corners */
```

### Theme Object (theme.ts)

Located in `src/theme.ts`

Centralized theme configuration with:
- Color palette (primary, secondary, accent, backgrounds, text)
- Typography (fonts, weights)
- Layout (border radius, container settings)
- Effects (shadows, transitions)
- Component-specific styles
- Dark mode settings
- Template metadata

Access via:
```typescript
import { techGadgetsTheme } from './theme';

const primaryColor = techGadgetsTheme.colors.primary;
```

---

## File Structure

```
tech-gadgets/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── TechBadge.tsx
│   │   └── index.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── theme.ts
├── vite.config.ts
├── package.json
├── README.md
└── COMPONENTS.md
```

---

## Best Practices

1. **Use Layout Components**: Always wrap pages with `<Navbar>` and `<Footer>`
2. **Consistent Styling**: Use CSS utility classes instead of inline styles
3. **Responsive Design**: Test all components on mobile, tablet, and desktop
4. **Accessibility**: Include ARIA labels and semantic HTML
5. **Performance**: Use glow effects sparingly (they can impact performance)
6. **Dark Mode**: Design for dark backgrounds (template default)
7. **Icons**: Use Lucide React for consistent iconography
8. **Type Safety**: Leverage TypeScript interfaces for all components

---

## Examples

### Complete Page Template

```tsx
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProductCard from './components/ProductCard';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartItemCount={2} />

      <main className="container-tech py-12">
        <h1 className="section-header-tech">My Products</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProductCard
            id="1"
            name="Product Name"
            description="Product description"
            price={999}
            badge="New"
            rating={4.5}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

### Using Tech Utilities

```tsx
<section className="grid-pattern scanlines py-24">
  <div className="container-tech">
    <h2 className="animated-gradient-text text-4xl font-bold mb-8">
      Featured Products
    </h2>

    <div className="card-tech tech-glow-hover p-6">
      <p className="text-muted-foreground">Card content</p>
    </div>

    <button className="btn-tech-accent mt-6">
      Shop Now
    </button>
  </div>
</section>
```

---

## Support

For questions or issues with the Tech Gadgets template:
- Review this documentation
- Check the README.md for setup instructions
- Refer to theme.ts for color and style configuration
- Examine existing pages for usage patterns
