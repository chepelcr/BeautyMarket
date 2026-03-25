# Pet Care Template

A playful and friendly e-commerce template for pet products and services.

## Theme Specifications

**Visual Identity:**
- **Primary Color:** Friendly Blue `#2563eb` (Blue-600)
- **Secondary Color:** Playful Orange `#f97316` (Orange-500)
- **Accent Color:** Grass Green `#16a34a` (Green-600)
- **Background:** Soft sky `#f0f9ff` (Blue-50)
- **Font:** Nunito (rounded, friendly, approachable)
- **Style:** Playful, friendly, caring, fun
- **Aesthetic:** Rounded corners, paw-themed graphics, playful animations

## Features

- Rounded corners everywhere (extra-rounded for friendly feel)
- Paw print decorative elements scattered in background
- Pet-specific icons (dog, cat, bird, heart-paw, bone, pet house)
- Playful animations (bounce, wiggle)
- Responsive grid layout
- Three main pet categories: Dogs, Cats, Other Pets
- Gradient call-to-action sections
- Shadow effects for depth

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

Builds to: `../../dist/templates/pet-care`

## Pages

### HomePage
Main landing page showcasing:
- Hero section with animated paw prints
- Pet category cards (Dogs, Cats, Other Pets)
- Features section
- Call-to-action section with gradient background

### ProductsPage
Product listing and browsing:
- Search functionality
- Category filtering
- Pet type quick filters (Dogs, Cats, Other Pets)
- Product grid with responsive layout
- Mock product data with ratings and badges

### ProductDetailPage
Detailed product view:
- Image gallery with thumbnails
- Product information and specifications
- Quantity selector
- Add to cart functionality
- Favorite toggle
- Trust badges (Free Shipping, Quality Guaranteed, Easy Returns)

### CartPage
Shopping cart management:
- Cart item list with images
- Quantity controls
- Remove items
- Promo code functionality
- Order summary with subtotal, discount, shipping
- Empty cart state

### NotFoundPage
Playful 404 error page:
- Animated pet icons
- Helpful navigation links
- Paw print trail decoration
- Quick links to popular sections

## Layout Components

### Navbar
Sticky navigation bar:
- Logo with paw icon
- Desktop and mobile responsive menu
- Shopping cart with item counter
- Favorite button
- Sign in button
- Mobile hamburger menu

### Footer
Multi-column footer:
- Brand section with pet icons
- Quick links
- Support links
- Contact information with icons
- Social media buttons
- Decorative paw prints

## Reusable Components

### ProductCard
Reusable product display card:
- Product image with hover effects
- Badge support (Best Seller, New, Eco-Friendly)
- Favorite toggle button
- Star rating display
- Category tag
- Stock status
- Add to cart button
- Paw print decoration on hover

### PawPrintDecoration
Decorative paw prints scattered in the background for playful aesthetic.

### PetIcons
Collection of pet-themed icons:
- DogIcon
- CatIcon
- BirdIcon
- HeartPawIcon
- BoneIcon
- PetHouseIcon
- PawIcon

## Color Palette

```css
/* Primary - Friendly Blue */
--primary: 221 83% 53%;

/* Secondary - Playful Orange */
--secondary: 20 91% 54%;

/* Accent - Grass Green */
--accent: 142 71% 45%;

/* Background - Soft Sky */
--background: 204 100% 97%;
```

## Typography

- **Font:** Nunito (rounded, friendly)
- **Weights:** 300, 400, 500, 600, 700, 800

## Unique Features

1. **Paw Print Decorations** - Subtle paw prints in background
2. **Wiggle Animation** - Icons wiggle on hover
3. **Bounce Animation** - Soft bounce effect for hero elements
4. **Extra Rounded Corners** - All elements use generous border radius (1rem+)
5. **Playful Color Scheme** - Blue, orange, and green create friendly atmosphere
6. **Pet-Specific Icons** - Custom designed pet-themed iconography

## Live URL

https://pet-care-example.j-markets.jcampos.dev

## Template Type

Pet Products & Services - Optimized for pet care businesses, pet supply stores, grooming services, and veterinary clinics.

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Sticky navigation with mobile menu
│   │   └── Footer.tsx          # Multi-column footer
│   ├── PawPrintDecoration.tsx   # Background paw prints
│   ├── PetIcons.tsx             # Custom pet-themed icons
│   └── ProductCard.tsx          # Reusable product card
├── pages/
│   ├── HomePage.tsx             # Landing page
│   ├── ProductsPage.tsx         # Product listing
│   ├── ProductDetailPage.tsx    # Product detail view
│   ├── CartPage.tsx             # Shopping cart
│   └── NotFoundPage.tsx         # 404 error page
├── App.tsx                      # Main app with routing
├── main.tsx                     # Entry point
├── theme.ts                     # Theme configuration
└── index.css                    # Global styles & animations
```

## Routing

- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product detail
- `/cart` - Shopping cart
- `/services` - Services page (placeholder)
- `/about` - About page (placeholder)
- `/*` - 404 Not Found

## Animations

Custom playful animations defined in `index.css`:
- `animate-bounce-soft` - Gentle bouncing effect
- `animate-wiggle` - Rotation wiggle effect
- `animation-delay-200` - Delayed animation start

## Mock Data

The template includes mock product data with:
- 8 sample pet products
- Product images from Unsplash
- Categories: Dog Food, Cat Toys, Dog Beds, Cat Supplies, etc.
- Ratings, reviews, pricing
- Stock status and badges

## Customization

All theme values are centralized in `src/theme.ts`:
- Colors (primary, secondary, accent)
- Typography (fonts, sizes, weights)
- Spacing (border radius, padding)
- Effects (shadows, transitions)
- Component styles (buttons, cards, inputs)

Modify this file to customize the entire template's appearance.
