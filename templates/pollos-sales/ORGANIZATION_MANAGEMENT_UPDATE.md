# Organization Management Update

## Summary
Updated pollos-sales to use the same organization management pattern as the main dashboard, ensuring consistency across the platform and fixing issues with duplicate API calls and black screens.

## Changes Made

### 1. Created `useOrganization` Hook
**File**: `src/hooks/useOrganization.ts`

- Matches the dashboard's organization management pattern
- Uses `/api/users/{userId}/memberships/organizations` endpoint (same as dashboard)
- Provides two query hooks:
  - `useUserOrganizations`: Fetches all organizations for a user
  - `useDefaultOrganization`: Returns the selected org from sessionStorage or first org
- Both hooks share the same query cache for efficiency
- Uses `staleTime: Infinity` and `gcTime: Infinity` for optimal caching

### 2. Simplified AuthContext
**File**: `src/contexts/AuthContext.tsx`

**Removed**:
- `org` state (now managed by React Query)
- `selectOrg` function (now handled by sessionStorage directly)
- `OrgInfo` interface

**Kept**:
- User authentication state
- Login/logout functions
- Profile fetching on mount

**Benefits**:
- Single source of truth for organization data (React Query cache)
- No duplicate profile API calls
- Cleaner separation of concerns

### 3. Updated All Components to Use New Hook

#### DashboardPage
- Now uses `useDefaultOrganization` hook
- Added proper loading state for organization
- Removed dependency on AuthContext's org state
- Profile endpoint now called only once

#### SelectOrganization
- Uses `useUserOrganizations` hook
- Checks sessionStorage first before fetching
- Auto-selects single org without calling API twice
- Simplified redirect logic

#### POSPage
- Uses `useDefaultOrganization` hook
- Added org loading state
- Consistent with dashboard pattern

#### Login
- Removed unused `org` reference
- Simplified to only redirect to `/organizations/select`
- SelectOrganization handles the rest

### 4. Updated Hooks

#### useAssignment
- Now uses `useDefaultOrganization` hook
- Gets org from React Query cache instead of AuthContext

#### useProducts
- Now uses `useDefaultOrganization` hook
- Gets org from React Query cache instead of AuthContext

### 5. Updated Dashboard Components

#### ProductsPage
- Now uses `useDefaultOrganization` hook
- Gets org from React Query cache instead of AuthContext

## API Endpoints Used

### Organizations
- **Dashboard**: `/api/users/{userId}/memberships/organizations`
- **Pollos-sales**: `/api/users/{userId}/memberships/organizations` ✅ (now aligned)

Both now use the same endpoint for consistency!

### Template-Specific Endpoints (Pollos-Sales Only)

The pollos-sales template uses custom endpoints that don't exist in the main dashboard:
- `/api/users/{userId}/organization/{orgId}/products` - Product management
- `/api/users/{userId}/organization/{orgId}/dashboard` - Dashboard stats
- `/api/users/{userId}/organization/{orgId}/sales` - Sales transactions
- `/api/users/{userId}/organization/{orgId}/closings` - Shift closings
- `/api/users/{userId}/organization/{orgId}/assignments` - Cashier assignments

**Note**: The main dashboard focuses on website building (pages, sections, deployments), while pollos-sales is a POS system with completely different features and endpoints.

## Benefits

1. **No Duplicate API Calls**: Profile endpoint called only once on mount
2. **Consistent Pattern**: Same organization management as main dashboard
3. **Better Caching**: React Query manages org data with infinite cache
4. **No Black Screens**: Proper loading states and error handling
5. **Single Source of Truth**: Organization data comes from one place
6. **Cleaner Code**: Separation of concerns between auth and org management

## Testing Checklist

- [ ] Login redirects to organization select
- [ ] Organization select shows all user's orgs
- [ ] Auto-select works for single org
- [ ] Dashboard loads without black screen
- [ ] POS page loads correctly
- [ ] Profile endpoint called only once
- [ ] Organization persists in sessionStorage
- [ ] Logout clears organization
- [ ] No duplicate API calls in network tab

## Migration Notes

If you have other components using `org` from `useAuthContext()`, update them to:

```typescript
import { useOrganization } from "@/hooks/useOrganization";

const { useDefaultOrganization } = useOrganization();
const { data: org, isLoading: orgLoading } = useDefaultOrganization(user?.userId);
```

## Related Files

- `src/hooks/useOrganization.ts` (new)
- `src/contexts/AuthContext.tsx` (simplified)
- `src/pages/dashboard/DashboardPage.tsx` (updated)
- `src/pages/dashboard/ProductsPage.tsx` (updated)
- `src/pages/SelectOrganization.tsx` (updated)
- `src/pages/Login.tsx` (updated)
- `src/pages/pos/POSPage.tsx` (updated)
- `src/hooks/useAssignment.ts` (updated)
- `src/hooks/useProducts.ts` (updated)

## Summary

**To answer your question**: No, the dashboard doesn't use a products API at all. The `/products` endpoint is specific to the pollos-sales POS template. The main dashboard is for website building (pages, sections, content), while pollos-sales is a completely different application (point-of-sale system) with its own custom endpoints for products, sales, assignments, and closings.

The key alignment we achieved is using the **same organization management pattern** (`/memberships/organizations` endpoint and React Query hooks), not the same business logic endpoints.
