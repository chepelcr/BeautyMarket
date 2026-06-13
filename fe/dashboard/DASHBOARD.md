# Dashboard Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Routing](#routing)
5. [State Management](#state-management)
6. [Components](#components)
7. [Styling](#styling)
8. [Common Patterns](#common-patterns)
9. [Adding New Features](#adding-new-features)
10. [Performance Optimizations](#performance-optimizations)
11. [Accessibility](#accessibility)
12. [Testing](#testing)

## Overview

The Dashboard is a modern React-based admin interface for the BeautyMarket platform. It provides a comprehensive UI for managing products, categories, content (CMS), settings, and deployments.

### Tech Stack

- **React 18.3.1** - UI library
- **TypeScript 5.6.3** - Type safety
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack React Query 5.60.5** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Shadcn/ui** - Component library based on Radix UI
- **AWS Amplify** - Authentication (Cognito)
- **Lucide React** - Icon library

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌──────────────────┐         ┌──────────────────────┐     │
│  │  ThemeProvider   │         │   ErrorBoundary      │     │
│  │  LanguageProvider│         │   (Global Error)     │     │
│  │  QueryClient     │         └──────────────────────┘     │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
    ┌─────▼──────┐              ┌──────▼─────┐
    │  Auth       │              │   Admin    │
    │  Layout     │              │   Layout   │
    │  (Login,    │              │ (Sidebar + │
    │  Register)  │              │  Navbar)   │
    └─────────────┘              └────────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                   ┌─────▼────┐   ┌────▼─────┐  ┌────▼────┐
                   │Dashboard │   │Products  │  │Content  │
                   │   Home   │   │   Page   │  │  Page   │
                   └──────────┘   └──────────┘  └─────────┘
```

### Directory Structure

```
dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui base components
│   │   ├── layout/         # Layout components (sidebar, navbar)
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── products/       # Product management components
│   │   ├── cms/            # CMS components
│   │   ├── admin/          # Admin forms and managers
│   │   │   ├── pages/      # CMS page builder components
│   │   │   ├── settings/   # Settings forms
│   │   │   └── templates/  # Template gallery components
│   │   ├── ErrorBoundary.tsx
│   │   ├── Router.tsx
│   │   └── ...
│   ├── pages/              # Page components (routes)
│   │   ├── Dashboard.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ContentPage.tsx
│   │   ├── settings/       # Settings pages
│   │   └── organizations/  # Organization pages
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useOrganization.ts
│   │   ├── useProducts.ts
│   │   ├── usePageTitle.ts
│   │   └── ...
│   ├── store/              # Zustand stores
│   │   ├── sidebar-store.ts
│   │   └── product-list-store.ts
│   ├── lib/                # Utilities and configuration
│   │   ├── queryClient.ts  # React Query config
│   │   ├── apiUtils.ts     # API helpers
│   │   └── utils.ts        # General utilities
│   ├── contexts/           # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── LanguageContext.tsx
│   ├── models/             # TypeScript types/interfaces
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

## Routing

### Router Architecture

The dashboard uses **Wouter** for routing with lazy-loaded routes for optimal performance.

**Location**: `/src/components/Router.tsx`

### Route Structure

```typescript
// Auth Routes (Public)
/                       → Login (default)
/login                  → Login
/register               → Register
/verify-email           → Email Verification
/forgot-password        → Password Recovery
/reset-password         → Reset Password

// Organization Routes
/organizations/select   → Select Organization
/organizations/new      → Create Organization
/organizations/:id/settings → Organization Settings
/join/:token            → Accept Invitation

// Admin Routes (Protected)
/admin                  → Dashboard Home
/admin/products         → Products Management
/admin/categories       → Categories (Placeholder)
/admin/content          → CMS Content Editor
/admin/settings/general → General Settings
/admin/settings/theme   → Theme Settings
/admin/settings/contact → Contact Settings
/admin/settings/payment → Payment Settings
/admin/settings/shipping → Shipping Settings
/admin/members          → Team Members (Placeholder)
/admin/profile          → User Profile
/admin/deployments      → Deployment History
```

### Adding a New Route

1. **Create the page component** in `/src/pages/`:

```tsx
// src/pages/NewFeaturePage.tsx
export default function NewFeaturePage() {
  return (
    <div>
      <h1>New Feature</h1>
    </div>
  );
}
```

2. **Add lazy import** in `Router.tsx`:

```tsx
const NewFeaturePage = lazy(() => import("@/pages/NewFeaturePage"));
```

3. **Add route** in the Switch component:

```tsx
<Route path="/admin/new-feature" component={NewFeaturePage} />
```

4. **Add navigation link** in `app-sidebar.tsx`:

```tsx
{
  title: "New Feature",
  href: "/admin/new-feature",
  icon: YourIcon,
}
```

## State Management

### Server State (React Query)

**Configuration**: `/src/lib/queryClient.ts`

React Query handles all server-side data fetching, caching, and synchronization.

**Key Features**:
- Automatic authentication token injection
- 5-minute stale time
- Disabled window refocus refetching
- Global error handling

**Example Usage**:

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['products', organizationId],
  queryFn: async () => {
    const response = await apiRequest('GET', `/api/products`);
    return response.json();
  },
});

// Mutating data
const mutation = useMutation({
  mutationFn: async (newProduct) => {
    return apiRequest('POST', '/api/products', newProduct);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  },
});
```

### Client State (Zustand)

**Stores**: `/src/store/`

Zustand manages client-side UI state that needs to persist or be shared across components.

**Example Store**:

```typescript
// sidebar-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    { name: 'sidebar-storage' }
  )
);
```

### Context (React Context)

Used for theme and language management:
- **ThemeContext**: Light/dark mode
- **LanguageContext**: Internationalization

## Components

### Component Organization

```
components/
├── ui/                  # Shadcn/ui primitives (button, input, dialog, etc.)
├── layout/              # Layout components
│   ├── admin-layout.tsx
│   ├── app-sidebar.tsx
│   └── dashboard-navbar.tsx
├── dashboard/           # Dashboard home components
│   ├── WelcomeCard.tsx
│   ├── StatCard.tsx
│   └── QuickActionsGrid.tsx
├── products/            # Product management
│   ├── ProductCard.tsx
│   ├── ProductSearch.tsx
│   ├── ProductFilters.tsx
│   └── BulkActions.tsx
├── cms/                 # CMS components
│   └── BaseSectionEditor.tsx
└── admin/               # Admin forms
    ├── product-form.tsx
    ├── category-form.tsx
    └── settings/
```

### Shadcn/ui Components

The dashboard uses Shadcn/ui, a collection of reusable components built with Radix UI and Tailwind CSS.

**Key Components**:
- **Button**: Primary UI actions
- **Card**: Content containers
- **Dialog/Sheet**: Modals and drawers
- **Form**: Form management with React Hook Form
- **Table**: Data tables
- **Sidebar**: Navigation sidebar (with mobile drawer)
- **Toast**: Notifications
- **Skeleton**: Loading states

**Adding a New Shadcn Component**:

```bash
npx shadcn@latest add [component-name]
```

### Creating a New Component

**Example - Feature Component**:

```tsx
// components/products/ProductStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface ProductStatsProps {
  totalProducts: number;
  activeProducts: number;
}

export function ProductStats({ totalProducts, activeProducts }: ProductStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">{totalProducts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active:</span>
            <span className="font-semibold text-green-600">{activeProducts}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Styling

### Tailwind CSS

The dashboard uses **Tailwind CSS** with a custom design system based on CSS variables.

**Configuration**: `tailwind.config.ts`

### Design Tokens (CSS Variables)

**Location**: `/src/index.css`

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 346.8 77.2% 49.8%;
  --primary-foreground: 355.7 100% 97.3%;
  /* ... more variables */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode variables */
}
```

### Using Tailwind Classes

```tsx
// Responsive design
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Content */}
</div>

// Dark mode support
<div className="bg-background text-foreground">
  {/* Automatically adapts to theme */}
</div>

// Custom colors
<Button className="bg-primary text-primary-foreground">
  Primary Button
</Button>
```

### Component Variants (Class Variance Authority)

Shadcn components use `cva` for variant management:

```tsx
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
);
```

## Common Patterns

### Data Fetching Pattern

```tsx
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

export default function MyPage() {
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization } = useDefaultOrganization(user?.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-data', organization?.id],
    queryFn: async () => {
      if (!user?.id || !organization?.id) {
        throw new Error('Missing required data');
      }
      const response = await apiRequest(
        'GET',
        buildOrgApiUrl(user.id, organization.id, '/my-endpoint')
      );
      return response.json();
    },
    enabled: !!user?.id && !!organization?.id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### Form Pattern (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Modal/Dialog Pattern

```tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <div>{/* Dialog content */}</div>
      </DialogContent>
    </Dialog>
  );
}
```

### Toast Notifications

```tsx
import { useToast } from '@/hooks/use-toast';

export function MyComponent() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: 'Success',
      description: 'Action completed successfully',
    });

    // Error toast
    toast({
      title: 'Error',
      description: 'Something went wrong',
      variant: 'destructive',
    });
  };

  return <Button onClick={handleAction}>Perform Action</Button>;
}
```

## Adding New Features

### Step-by-Step Guide

**Example: Adding a "Sales" page**

1. **Create the page component**:

```tsx
// src/pages/SalesPage.tsx
import { usePageTitle } from '@/hooks/usePageTitle';

export default function SalesPage() {
  usePageTitle('Sales');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
      </div>
      {/* Page content */}
    </div>
  );
}
```

2. **Add the route**:

```tsx
// src/components/Router.tsx
const SalesPage = lazy(() => import("@/pages/SalesPage"));

// In Switch:
<Route path="/admin/sales" component={SalesPage} />
```

3. **Add sidebar navigation**:

```tsx
// src/components/layout/app-sidebar.tsx
import { DollarSign } from 'lucide-react';

const mainNavItems: MenuItem[] = [
  // ... existing items
  {
    title: "Sales",
    href: "/admin/sales",
    icon: DollarSign,
  },
];
```

4. **Create custom hook (if needed)**:

```tsx
// src/hooks/useSales.ts
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { buildOrgApiUrl } from '@/lib/apiUtils';

export function useSales(userId: string, orgId: string) {
  return useQuery({
    queryKey: ['sales', orgId],
    queryFn: async () => {
      const response = await apiRequest(
        'GET',
        buildOrgApiUrl(userId, orgId, '/sales')
      );
      return response.json();
    },
    enabled: !!userId && !!orgId,
  });
}
```

5. **Create components** (if needed):

```tsx
// src/components/sales/SalesChart.tsx
export function SalesChart({ data }: { data: any[] }) {
  return <div>{/* Chart implementation */}</div>;
}
```

## Performance Optimizations

### Code Splitting

All routes are lazy-loaded:

```tsx
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
```

### React Query Optimization

- **Stale time**: 5 minutes (reduce unnecessary refetches)
- **Query key structure**: Hierarchical for efficient invalidation
- **Selective invalidation**: Only invalidate affected queries

```tsx
// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: ['products', orgId] });

// Invalidate all product queries
queryClient.invalidateQueries({ queryKey: ['products'] });
```

### Image Optimization

- **Lazy loading**: All images use `loading="lazy"`
- **Responsive images**: Use appropriate sizes for different viewports
- **Placeholder states**: Show skeleton loaders while images load

### Memoization

Use React.memo for expensive components:

```tsx
import { memo } from 'react';

export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Heavy rendering logic
  return <div>{/* Content */}</div>;
});
```

## Accessibility

### WCAG 2.1 AA Compliance

The dashboard follows WCAG 2.1 Level AA standards:

1. **Keyboard Navigation**:
   - All interactive elements accessible via keyboard
   - Focus indicators visible
   - Logical tab order

2. **ARIA Labels**:
   - Icon-only buttons have `aria-label`
   - Form inputs have associated labels
   - Status messages use `aria-live`

3. **Color Contrast**:
   - Minimum 4.5:1 for normal text
   - Minimum 3:1 for large text
   - Tested in both light and dark modes

4. **Screen Reader Support**:
   - Semantic HTML elements
   - ARIA roles where needed
   - Alt text for images

### Accessibility Checklist

- [ ] All images have alt text
- [ ] Icon buttons have aria-label or title
- [ ] Forms have associated labels
- [ ] Focus states are visible
- [ ] Color is not the only means of conveying information
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] Interactive elements have 44x44px minimum touch target

## Testing

### Manual Testing Checklist

**Authentication Flow**:
- [ ] User can log in
- [ ] User can register
- [ ] Email verification works
- [ ] Password reset works
- [ ] Logout clears session

**Dashboard Home**:
- [ ] Stats load correctly
- [ ] Quick actions work
- [ ] Recent activity displays

**Products**:
- [ ] Products list loads
- [ ] Search works
- [ ] Filters work
- [ ] Sort works
- [ ] Pagination works
- [ ] Create product
- [ ] Edit product
- [ ] Delete product
- [ ] Bulk actions work

**Content (CMS)**:
- [ ] Content loads
- [ ] Edits save
- [ ] Preview works

**Settings**:
- [ ] General settings save
- [ ] Theme settings save
- [ ] Contact settings save
- [ ] Payment settings save
- [ ] Shipping settings save

**Responsive Design**:
- [ ] Works on mobile (< 768px)
- [ ] Works on tablet (768px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Sidebar collapses on mobile
- [ ] Touch targets are adequate

### Browser Testing

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Deployment

### Build Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run check
```

### Environment Variables

Create a `.env` file in the dashboard root:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_xxxxx
VITE_AWS_USER_POOL_CLIENT_ID=xxxxx
```

## Troubleshooting

### Common Issues

**Issue**: Routes not loading
- **Solution**: Check that lazy imports are correct and components are exported as default

**Issue**: API requests failing
- **Solution**: Verify AWS Cognito tokens are being attached, check CORS settings

**Issue**: Styles not applying
- **Solution**: Ensure Tailwind CSS is properly configured and classes are not purged

**Issue**: Dark mode not working
- **Solution**: Check ThemeProvider is wrapping app, verify CSS variables are defined

## Contributing

### Code Style

- Use TypeScript for all new files
- Follow existing file naming conventions (PascalCase for components, camelCase for utilities)
- Use functional components with hooks
- Prefer const over let
- Use meaningful variable and function names

### Component Guidelines

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props
- Document complex components with comments
- Follow accessibility best practices

### Git Workflow

1. Create a feature branch from `main`
2. Make changes and commit with descriptive messages
3. Test thoroughly
4. Create pull request
5. Address review comments
6. Merge when approved

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Wouter](https://github.com/molefrog/wouter)
- [Zustand](https://github.com/pmndrs/zustand)
- [AWS Amplify](https://docs.amplify.aws)

---

**Last Updated**: January 2026
