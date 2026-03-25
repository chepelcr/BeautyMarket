# Frontend Standards & Patterns

This document defines the frontend architecture, patterns, and standards for the BeautyMarket project. Follow these guidelines to maintain consistency across both client applications.

---

## Table of Contents

1. [Translation System](#translation-system)
2. [Styling Standards](#styling-standards)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Custom Hooks](#custom-hooks)
6. [Form Patterns](#form-patterns)
7. [File Organization](#file-organization)
8. [Code Examples](#code-examples)

---

## Translation System

### Current Implementation

**landing-client**: ✅ Has full i18n support
**client**: ❌ No i18n - hardcoded Spanish text (needs standardization)

### Architecture

- **Library**: Custom React Context (no external dependencies like i18next)
- **Languages**: English (en), Spanish (es)
- **Storage**: `localStorage` key: `'language'`
- **Location**: `landing-client/src/contexts/LanguageContext.tsx`

### Translation Structure

Translations use hierarchical dot notation:

```typescript
const translations = {
  en: {
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'auth.login.email': 'Email address',
    'auth.login.password': 'Password',
    'auth.register.title': 'Create your account',
    'features.title': 'Features',
    // 840+ keys total
  },
  es: {
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    // ...
  }
};
```

### Usage in Components

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('auth.register.title')}</h1>
      <button onClick={() => setLanguage('es')}>
        {t('common.changeLanguage')}
      </button>
    </div>
  );
}
```

### Adding New Translations

1. Open `landing-client/src/contexts/LanguageContext.tsx`
2. Add key to both `en` and `es` objects:

```typescript
const translations = {
  en: {
    // ... existing keys
    'myFeature.newKey': 'New English Text',
  },
  es: {
    // ... existing keys
    'myFeature.newKey': 'Nuevo Texto en Español',
  }
};
```

3. Use in component: `t('myFeature.newKey')`

### Language Detection

- Checks `localStorage.getItem('language')` first
- Falls back to browser language: `navigator.language`
- Defaults to 'es' for Spanish locales, 'en' otherwise

### TODO: Standardize Across Apps

The main `client` app should be updated to use the same translation system for consistency.

---

## Styling Standards

### CSS Framework

**Tailwind CSS v3.4.17** - Utility-first CSS framework

### Configuration Files

- `tailwind.config.ts` - Shared Tailwind configuration
- `client/src/index.css` - Global styles for main client
- `landing-client/src/index.css` - Global styles for landing client
- `postcss.config.js` - PostCSS configuration

### Color System

Colors are defined using **CSS variables with HSL values** for seamless dark mode support.

#### Brand Colors

```css
:root {
  /* Primary (Blue) */
  --primary: 217 91% 60%;
  --primary-foreground: 210 40% 98%;

  /* Secondary (Lime Green - landing) */
  --secondary: 84 81% 44%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  /* Accent */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Background */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  /* Card */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  /* Muted */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* Destructive */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
}
```

#### Dark Mode Colors

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... */
}
```

### Typography

```css
/* Fonts */
--font-sans: 'Inter', 'Nunito', sans-serif;
--font-serif: 'Playfair Display', serif;

/* Usage */
.heading { font-family: var(--font-serif); }
.body { font-family: var(--font-sans); }
```

### Theme Toggle

Dark mode is implemented via React Context with class-based approach:

```typescript
// ThemeContext provides
const { theme, setTheme, resolvedTheme } = useTheme();

// theme: 'light' | 'dark' | 'system'
// resolvedTheme: 'light' | 'dark' (actual theme applied)

// Applies to HTML element
<html class="dark"> or <html class="light">
```

### Component Styling Pattern

Use Tailwind utility classes directly:

```tsx
// Good: Direct Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
    Title
  </h2>
</div>

// Avoid: Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### Custom Utility Classes

Use `@layer components` in `index.css` for reusable component classes:

```css
@layer components {
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md;
  }

  .card-primary {
    @apply bg-card text-card-foreground border border-border rounded-lg shadow-sm;
  }
}
```

### Responsive Design

Mobile-first approach with Tailwind breakpoints:

```tsx
<div className="
  flex flex-col      /* mobile: column */
  md:flex-row        /* tablet+: row */
  lg:gap-8           /* desktop: larger gap */
">
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## Component Architecture

### Project Structure

```
/client or /landing-client
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn/Radix UI primitives
│   │   ├── layout/          # Layout components (navbar, footer)
│   │   └── *.tsx            # Feature components
│   ├── pages/               # Page-level components
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React Context providers
│   ├── lib/                 # Utilities and configurations
│   ├── store/               # Zustand stores
│   ├── models/              # TypeScript interfaces
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
```

### UI Component Library

**Shadcn/ui** - Pre-built accessible components based on Radix UI

Components are located in `src/components/ui/`:
- `button.tsx` - Button variants
- `card.tsx` - Card layouts
- `form.tsx` - Form composition
- `input.tsx` - Input fields
- `dialog.tsx` - Modal dialogs
- `select.tsx` - Dropdown selects
- `toast.tsx` - Toast notifications
- And 40+ more...

### Page Component Pattern

```tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MyPage() {
  // 1. Hooks at the top
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(null);

  // 2. Effects
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // 3. Handlers
  const handleAction = async () => {
    try {
      // API call
      toast({ title: 'Success' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 4. Loading/error states
  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  // 5. Render
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Page Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAction}>Action</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Lazy Loading Pattern

Use `@loadable/component` for code splitting:

```tsx
import loadable from '@loadable/component';

const Home = loadable(() => import('@/pages/home'), {
  fallback: <PageLoader />
});

const Products = loadable(() => import('@/pages/products'), {
  fallback: <PageLoader />
});
```

### Multi-Step Form Pattern

See `landing-client/src/pages/Register.tsx` for reference:

```tsx
function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [step1Data, setStep1Data] = useState(null);

  const handleStep1Submit = (values) => {
    setStep1Data(values);
    setCompletedSteps(['step1']);
    setCurrentStep('step2');
  };

  return (
    <Card>
      <CardHeader>
        <ProgressSteps
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </CardHeader>
      <CardContent>
        {currentStep === 'step1' && <Step1Form onSubmit={handleStep1Submit} />}
        {currentStep === 'step2' && <Step2Form onBack={() => setCurrentStep('step1')} />}
      </CardContent>
    </Card>
  );
}
```

---

## State Management

### When to Use What

| State Type | Tool | Use Case | Example |
|------------|------|----------|---------|
| Server State | React Query | API data, caching, background refetching | User profile, products list |
| Client State (Persistent) | Zustand + persist | Shopping cart, user preferences | Cart items, theme |
| Client State (Temporary) | Zustand | UI state across components | Sidebar open/closed |
| Global UI State | React Context | Auth, theme, language | useAuth, useTheme |
| Form State | React Hook Form | Form inputs, validation | Login form, register form |
| Component State | useState | Local component state | Modal open, password visible |

### React Query Pattern

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['user-profile', userId],
  queryFn: async () => {
    const response = await authenticatedRequest('GET', `/users/${userId}/profile`);
    return response.json();
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: false,
});

// Mutation with cache invalidation
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await authenticatedRequest('POST', '/endpoint', data);
    return response.json();
  },
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  },
});

// Usage
mutation.mutate(formData);
```

### Zustand Pattern

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  total: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addToCart: (item) => set((state) => ({
        items: [...state.items, item],
        total: state.total + item.price
      })),

      removeFromCart: (itemId) => set((state) => ({
        items: state.items.filter(i => i.id !== itemId),
        total: state.items
          .filter(i => i.id !== itemId)
          .reduce((sum, i) => sum + i.price, 0)
      })),

      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);

// Usage in component
const { items, addToCart } = useCartStore();
```

### Context Pattern

```tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);

    // Resolve system theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    // Apply to DOM
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

---

## Custom Hooks

### useAuth Hook

**Location**: `client/src/hooks/useAuth.ts`

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const {
    // State
    user,              // User profile or null
    isAuthenticated,   // boolean
    isLoading,         // boolean

    // Mutations
    register,          // Register mutation
    login,             // Login mutation
    verifyEmail,       // Email verification mutation
    logout,            // Logout function

    // Utilities
    authenticatedRequest, // Request wrapper with JWT
  } = useAuth();

  const handleLogin = async () => {
    try {
      const result = await login.mutateAsync({
        email: 'user@example.com',
        password: 'password123'
      });

      if (result.needsVerification) {
        navigate('/verify-email');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <LoginForm />;

  return <Dashboard user={user} />;
}
```

### useOrganization Hook

**Location**: `client/src/hooks/useOrganization.ts`

```tsx
import { useOrganization } from '@/hooks/useOrganization';

function OrganizationPage() {
  const {
    // Queries
    useUserOrganizations,       // Get user's organizations
    useOrganizationById,        // Get org by ID
    useOrganizationBySubdomain, // Get org by subdomain (public)

    // Mutations
    createOrganization,         // Create new organization
    updateOrganization,         // Update organization

    // Utilities
    checkSlugAvailable,         // Check if slug is available
    checkSubdomainAvailable,    // Check if subdomain is available
  } = useOrganization();

  const { data: organizations, isLoading } = useUserOrganizations(userId);

  const handleCreate = async () => {
    const available = await checkSlugAvailable('my-store');
    if (available) {
      await createOrganization.mutateAsync({
        name: 'My Store',
        slug: 'my-store',
        subdomain: 'mystore',
      });
    }
  };
}
```

### Creating New Hooks

Follow these guidelines:

1. **Name**: Use `use` prefix (e.g., `useMyFeature`)
2. **Location**: `src/hooks/useMyFeature.ts`
3. **Return object**: Return consistent object structure
4. **Dependencies**: Import from React Query for server state

```tsx
// Template for new hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedRequest } from './useAuth';

export function useMyFeature() {
  const queryClient = useQueryClient();

  // Query
  const query = useQuery({
    queryKey: ['my-feature'],
    queryFn: async () => {
      const response = await authenticatedRequest('GET', '/api/my-feature');
      return response.json();
    },
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await authenticatedRequest('POST', '/api/my-feature', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feature'] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    mutate: mutation.mutate,
  };
}
```

---

## Form Patterns

### Standard Form Pattern

Use **React Hook Form** + **Zod** for all forms.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// 1. Define Zod schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
});

type FormValues = z.infer<typeof formSchema>;

// 2. Create form component
function LoginForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 3. Submit handler
  const onSubmit = async (values: FormValues) => {
    try {
      await login.mutateAsync(values);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // 4. Render form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </Form>
  );
}
```

### Complex Validation

Use Zod's `.refine()` for cross-field validation:

```tsx
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Error shows on confirmPassword field
});
```

### Conditional Fields

```tsx
const schema = z.object({
  gender: z.string().optional(),
  genderOther: z.string().optional(),
}).refine((data) => {
  // If gender is "other", genderOther must be provided
  if (data.gender === 'other' && !data.genderOther?.trim()) {
    return false;
  }
  return true;
}, {
  message: 'Please specify your gender',
  path: ['genderOther'],
});
```

### Password Visibility Toggle

```tsx
const [showPassword, setShowPassword] = useState(false);

<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    {...field}
  />
  <Button
    type="button"
    variant="ghost"
    size="sm"
    className="absolute right-0 top-0 h-full"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </Button>
</div>
```

---

## File Organization

### Directory Structure

```
/src
├── components/
│   ├── ui/              # Shadcn components (lowercase)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── form.tsx
│   ├── layout/          # Layout components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   └── MyFeature.tsx    # Feature components (PascalCase)
├── pages/               # Page components (lowercase)
│   ├── home.tsx
│   ├── login.tsx
│   └── register.tsx
├── hooks/               # Custom hooks (camelCase)
│   ├── useAuth.ts
│   └── useOrganization.ts
├── contexts/            # React contexts (PascalCase)
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── lib/                 # Utilities (camelCase)
│   ├── utils.ts
│   ├── apiUtils.ts
│   └── amplify.ts
├── store/               # Zustand stores (camelCase)
│   └── cart.ts
├── models/              # TypeScript types (camelCase)
│   └── types.ts
├── App.tsx              # Main app
└── main.tsx             # Entry point
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Pages**: lowercase (`home.tsx`, `login.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utilities**: camelCase (`apiUtils.ts`)
- **Context**: PascalCase with `Context` suffix (`LanguageContext.tsx`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `CartItem`)

### Import Organization

Order imports by type:

```tsx
// 1. External libraries
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

// 2. Hooks
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// 3. Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// 4. Utilities
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/apiUtils';

// 5. Types
import type { User } from '@/models/types';
```

---

## Code Examples

### Complete Login Page Example

```tsx
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login.mutateAsync(values);

      if (result.needsVerification) {
        sessionStorage.setItem('verificationEmail', values.email);
        navigate('/verify-email');
        return;
      }

      toast({
        title: t('auth.login.success'),
        description: t('auth.login.successDescription'),
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('auth.login.error'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.login.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('auth.login.emailPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.login.password')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('auth.login.passwordPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending}
              >
                {login.isPending ? t('common.loading') : t('auth.login.submit')}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {t('auth.login.noAccount')}{' '}
            </span>
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => navigate('/register')}
            >
              {t('auth.login.signUp')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### API Integration Example

```tsx
import { useAuth } from '@/hooks/useAuth';
import { buildUserApiUrl } from '@/lib/apiUtils';

function MyComponent() {
  const { authenticatedRequest } = useAuth();

  const fetchData = async () => {
    try {
      const response = await authenticatedRequest(
        'GET',
        buildUserApiUrl(userId, '/organizations')
      );

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  const postData = async (payload) => {
    const response = await authenticatedRequest(
      'POST',
      buildUserApiUrl(userId, '/organizations'),
      payload // Automatically stringified
    );

    return response.json();
  };
}
```

---

## Best Practices Summary

### ✅ Do

- Use TypeScript for all new files
- Use Tailwind utilities for styling
- Use React Hook Form + Zod for forms
- Use React Query for server state
- Use Zustand for persistent client state
- Use Context for global UI state
- Follow naming conventions
- Use translations in landing-client
- Implement dark mode support
- Use toast notifications for feedback
- Handle loading and error states

### ❌ Don't

- Don't use inline styles
- Don't use CSS modules or styled-components
- Don't hardcode text (use translations)
- Don't skip form validation
- Don't ignore TypeScript errors
- Don't mix state management approaches
- Don't forget to invalidate React Query cache on mutations
- Don't create custom hooks without following patterns

---

## Migration TODO

### Standardize Translation System

The main `client` app needs to be updated to use the same translation system as `landing-client`:

1. Copy `LanguageContext.tsx` from landing-client to client
2. Add translation keys for all hardcoded Spanish text
3. Wrap App in `LanguageProvider`
4. Replace all hardcoded text with `t('key')` calls
5. Add language switcher to navbar

---

## Questions or Updates?

If you need to add new patterns or update this document, please ensure:

1. Code examples are tested and working
2. Patterns are consistent with existing codebase
3. TypeScript types are included
4. Both light and dark mode are considered
5. Accessibility is maintained (Radix UI handles most of this)

This document should evolve as the project grows. Keep it updated!
