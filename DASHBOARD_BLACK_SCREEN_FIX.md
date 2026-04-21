# Dashboard Black Screen Issue & Login Flow Comparison

## Issue: Dashboard Showing Black Screen

### Root Cause
The dashboard is likely stuck in dark mode with a very dark background color:
```css
.dark {
  --background: 20 14% 8%;  /* Very dark brown/black */
}
```

### Potential Causes:
1. **Theme persistence issue** - Dark mode preference stored in localStorage
2. **Missing theme initialization** - ThemeContext not properly initializing
3. **CSS loading issue** - Tailwind/CSS not fully loaded

### Quick Fixes to Try:

1. **Clear localStorage** (most likely fix):
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

2. **Force light mode** - Add to `ThemeContext` initialization:
```typescript
const [theme, setTheme] = useState<"light" | "dark">("light"); // Force light
```

3. **Check browser console** for errors during app load

---

## Login Flow Comparison: Dashboard vs Pollos-Sales

### Dashboard Login Flow (Complex, Multi-Step)

**File**: `dashboard/src/pages/Login.tsx`

**Flow**:
1. Force logout on page load to clear stale sessions
2. User enters email/password
3. Call `login.mutateAsync(data)`
4. Check if email verification needed → redirect to `/verify-email`
5. On success → redirect to `/organizations/select`
6. User selects organization
7. Redirect to admin dashboard

**Key Features**:
- Email verification handling
- Organization selection step
- Session cleanup on mount
- Password visibility toggle
- Forgot password link
- Register link

**Auth Hook**: `useAuth()` from `@/hooks/useAuth`
- Uses AWS Amplify/Cognito
- Handles JWT tokens
- Manages user session

---

### Pollos-Sales Login Flow (Simple, Direct)

**File**: `templates/pollos-sales/src/pages/Login.tsx` (needs to be created)

**Recommended Flow** (based on App.tsx):
1. User enters credentials
2. Call authentication
3. Store user + role in AuthContext
4. Redirect to `/organizations/select` if no org
5. Redirect to role-based route:
   - `cajero` → `/pos`
   - `gerente/supervisor` → `/dashboard`

**Key Differences**:
- No email verification step
- Role-based routing (cajero, gerente, supervisor)
- Simpler organization handling
- Direct access to POS/Dashboard

**Auth Context**: `AuthProvider` from `@/contexts/AuthContext`
- Stores: `user`, `org`, `isLoading`
- Simpler than dashboard's auth

---

## Recommended Implementation for Pollos-Sales Login

### 1. Create Login Page

```typescript
// templates/pollos-sales/src/pages/Login.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Login() {
  const [, navigate] = useLocation();
  const { login, isLoading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login({ email, password });
      
      // Redirect handled by AuthContext or App.tsx
      const redirect = sessionStorage.getItem("redirectAfterLogin");
      if (redirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirect);
      } else {
        navigate("/organizations/select");
      }
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 font-playfair text-amber-900">
          Pollos Sales
        </h1>
        <p className="text-center text-gray-600 mb-6 font-barlow">
          Ingresa a tu cuenta
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 2. Key Differences from Dashboard:
- ✅ Simpler UI (no shadcn/ui components needed)
- ✅ Brand colors (amber/orange for chicken theme)
- ✅ No email verification
- ✅ No registration link (admin creates accounts)
- ✅ Spanish-only (no i18n needed)
- ✅ Direct role-based routing

### 3. AuthContext Requirements:
```typescript
interface AuthContextType {
  user: User | null;
  org: Organization | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}
```

---

## Next Steps

### For Dashboard Black Screen:
1. Open dashboard in browser
2. Open DevTools Console (F12)
3. Run: `localStorage.clear(); location.reload();`
4. Check if it loads properly

### For Pollos-Sales Login:
1. Create `templates/pollos-sales/src/pages/Login.tsx` with the code above
2. Ensure AuthContext has `login()` method
3. Test login flow with role-based routing
4. Style to match chicken/restaurant theme
