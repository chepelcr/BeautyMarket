# Fitness Hub - Component Tree

## Application Architecture

```
App (src/App.tsx)
│
├── Navbar (layout/Navbar.tsx)
│   ├── Logo (Dumbbell icon + gradient text)
│   ├── Desktop Navigation Links
│   │   ├── Home
│   │   ├── Products
│   │   ├── Programs (with TrendingUp icon)
│   │   └── About
│   ├── Cart Button (with badge counter)
│   └── Mobile Menu (hamburger + dropdown)
│
├── Main Content (Routes)
│   │
│   ├── Home (pages/Home.tsx)
│   │   ├── Hero Section
│   │   │   ├── Headline: "TRANSFORM YOUR FITNESS JOURNEY"
│   │   │   ├── Subheadline + Description
│   │   │   └── CTA Buttons (Shop Now, Explore Programs)
│   │   │
│   │   ├── Features Section
│   │   │   ├── Feature Card 1 (Zap icon - Premium Quality)
│   │   │   ├── Feature Card 2 (Target icon - Expert Guidance)
│   │   │   ├── Feature Card 3 (TrendingUp icon - Track Progress)
│   │   │   └── Feature Card 4 (Award icon - Proven Results)
│   │   │
│   │   ├── Featured Products Section
│   │   │   ├── Product Card 1 (Pro Dumbbells)
│   │   │   ├── Product Card 2 (Rowing Machine)
│   │   │   └── Product Card 3 (Yoga Mat)
│   │   │
│   │   └── CTA Section
│   │       ├── Headline: "READY TO DOMINATE?"
│   │       └── CTA Button (Get Started Now)
│   │
│   ├── Products (pages/Products.tsx)
│   │   ├── Header Section
│   │   │   └── Page Title: "SHOP EQUIPMENT"
│   │   │
│   │   ├── Search & Filter Bar
│   │   │   ├── Search Input (Search icon)
│   │   │   ├── Filter Button (Filter icon)
│   │   │   └── Sort Button (SlidersHorizontal icon)
│   │   │
│   │   └── Product Grid
│   │       ├── Product Card 1 (with badge: BESTSELLER)
│   │       ├── Product Card 2
│   │       ├── Product Card 3 (with badge: NEW)
│   │       ├── Product Card 4
│   │       ├── Product Card 5
│   │       ├── Product Card 6
│   │       ├── Product Card 7
│   │       └── Product Card 8 (with badge: PREMIUM)
│   │
│   ├── Cart (pages/Cart.tsx)
│   │   ├── Header Section
│   │   │   └── Page Title: "YOUR CART"
│   │   │
│   │   ├── Cart Items Section
│   │   │   ├── Cart Item 1
│   │   │   │   ├── Product Image
│   │   │   │   ├── Product Info (name, category)
│   │   │   │   ├── Quantity Controls (Minus, Count, Plus)
│   │   │   │   ├── Remove Button (Trash2 icon)
│   │   │   │   └── Price
│   │   │   ├── Cart Item 2
│   │   │   └── Cart Item 3
│   │   │
│   │   └── Order Summary (sticky sidebar)
│   │       ├── Subtotal
│   │       ├── Shipping (FREE)
│   │       ├── Total
│   │       ├── Checkout Button
│   │       ├── Continue Shopping Button
│   │       └── Free Shipping Badge
│   │
│   ├── ProductDetail (pages/ProductDetail.tsx)
│   │   └── Placeholder content
│   │
│   └── NotFound (pages/NotFound.tsx)
│       ├── 404 Text
│       ├── Error Message
│       └── Back to Home Button (Home icon)
│
└── Footer (layout/Footer.tsx)
    ├── Brand Section
    │   ├── Logo (Dumbbell + gradient text)
    │   ├── Description
    │   └── Social Icons (Facebook, Instagram, Twitter, Youtube)
    │
    ├── Shop Links
    │   ├── Equipment
    │   ├── Supplements
    │   ├── Apparel
    │   └── Accessories
    │
    ├── Support Links
    │   ├── Contact Us
    │   ├── Shipping Info
    │   ├── Returns
    │   └── FAQ
    │
    ├── Newsletter Section
    │   ├── Email Input
    │   └── Subscribe Button
    │
    └── Copyright Notice
```

## Fitness-Specific Components

### ProgressIndicator (components/fitness/ProgressIndicator.tsx)

```
ProgressIndicator
├── Label + Current/Goal Display
├── Progress Bar Container
│   └── Animated Fill (red-to-orange gradient)
│       └── Pulse Effect (if complete)
└── Achievement Message (if goal met)
```

**Props**:
- `label: string` - Progress bar label
- `current: number` - Current value
- `goal: number` - Goal value
- `unit?: string` - Unit label (default: '')
- `color?: 'red' | 'orange'` - Color variant (default: 'red')

**Features**:
- Framer Motion animation (width grows from 0 to percentage)
- Gradient fill effect
- Pulsing animation when goal achieved
- "GOAL ACHIEVED!" message

### AchievementBadge (components/fitness/AchievementBadge.tsx)

```
AchievementBadge
├── Badge Container (circular)
│   ├── Icon (award, trophy, target, zap, star, medal)
│   ├── Unlocked Indicator (green checkmark)
│   └── Locked Overlay ("LOCKED" text)
├── Title
└── Description
```

**Props**:
- `title: string` - Badge title
- `description: string` - Badge description
- `icon?: string` - Icon type (default: 'award')
- `unlocked?: boolean` - Lock state (default: false)
- `size?: 'sm' | 'md' | 'lg'` - Size variant (default: 'md')

**Features**:
- Hover effects (rotation wiggle, scale up)
- Tap effect (scale down)
- Gradient background (unlocked) vs gray (locked)
- Green checkmark badge overlay
- Locked state with semi-transparent overlay
- Responsive sizing

## Utility Functions (lib/utils.ts)

```typescript
cn(...inputs: ClassValue[]): string
// Merges Tailwind classes intelligently

formatPrice(price: number): string
// Formats price as USD currency ($299.00)

calculatePercentage(current: number, goal: number): number
// Calculates percentage with max 100%
```

## Icon Usage (Lucide React)

**Navigation**:
- `Dumbbell` - Logo icon
- `ShoppingCart` - Cart button
- `Menu` - Mobile menu toggle
- `TrendingUp` - Programs link

**Features**:
- `Zap` - Premium quality feature
- `Target` - Expert guidance feature
- `Award` - Proven results feature

**Actions**:
- `ArrowRight` - CTA buttons
- `Search` - Search input
- `Filter` - Filter button
- `SlidersHorizontal` - Sort button
- `Plus`, `Minus` - Quantity controls
- `Trash2` - Remove item

**Social**:
- `Facebook`, `Instagram`, `Twitter`, `Youtube` - Footer social icons

**Error**:
- `Home` - 404 back to home button

## Animation Strategy

**Framer Motion Usage**:

1. **Home Page Hero**:
   - Fade in + slide up on mount
   - Duration: 0.8s

2. **Feature Cards**:
   - Stagger animation (0.1s delay per card)
   - Fade in + slide up when in view

3. **Product Cards**:
   - Scale animation (0.9 to 1.0)
   - Stagger delay (0.1s per card)

4. **Progress Indicator**:
   - Width animation (0 to percentage)
   - Duration: 1s ease-out
   - Pulse effect on complete

5. **Achievement Badge**:
   - Hover: rotation wiggle + scale
   - Tap: scale down
   - Unlock animation: scale from 0 to 1

## Styling Philosophy

**Design Principles**:

1. **Bold Typography**:
   - Uppercase headings
   - Font weights 700-900
   - High contrast

2. **Energetic Colors**:
   - Red for action/motivation
   - Orange for energy/enthusiasm
   - Black for strength/seriousness

3. **High Contrast**:
   - Dark backgrounds (gray-900)
   - White text on dark
   - Bright accent colors

4. **Motion & Energy**:
   - Hover scale effects
   - Gradient animations
   - Transform transitions

5. **Athletic Aesthetic**:
   - Clean lines
   - Bold shapes
   - Performance-focused

## Responsive Breakpoints

```css
/* Mobile: < 768px */
- Single column layouts
- Mobile menu (hamburger)
- Stacked cards

/* Tablet: 768px - 1024px */
- 2-3 column grids
- Desktop nav appears

/* Desktop: > 1024px */
- 4 column product grids
- Full layout width
- Sticky sidebar in cart
```

## Theme Tokens (CSS Variables)

```css
/* Primary (Energetic Red) */
--primary: 0 72% 51%           /* #dc2626 */

/* Secondary (Bold Orange) */
--secondary: 20 91% 48%        /* #ea580c */

/* Accent (Deep Black) */
--accent: 0 0% 4%              /* #0a0a0a */

/* Background */
--background: 0 0% 100%        /* White */
--foreground: 0 0% 4%          /* Near Black */

/* Dark Mode */
--background: 0 0% 4%          /* Near Black */
--foreground: 0 0% 98%         /* Off White */
```

## Component Reusability

**Shared Pattern**:
All components follow consistent patterns:
- TypeScript with typed props
- Tailwind CSS for styling
- Lucide React for icons
- Framer Motion for animations
- Responsive design (mobile-first)

This makes the template easy to maintain and extend.
