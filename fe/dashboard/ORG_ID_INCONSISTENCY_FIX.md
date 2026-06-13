# Organization ID Inconsistency Fix

## Problem Identified

**Multiple pages** were using **localStorage** for the organization ID while others used the **useOrganization hook**, causing different org IDs to be sent to the API.

### Before the Fix:

#### ❌ Pages Using localStorage (WRONG):
- ConfirmationsPage.tsx
- ConfirmationDetailsPage.tsx  
- OrdersPage.tsx
- OrderDetailsPage.tsx

```typescript
// Getting org from localStorage
const [organization, setOrganization] = useState<any>(null);
useEffect(() => {
  const storedOrg = localStorage.getItem('selectedOrganization');
  setOrganization(JSON.parse(storedOrg));
}, []);
```

#### ✅ Pages Using Hook (CORRECT):
- CustomersPage.tsx
- ProductsPage.tsx
- CategoriesPage.tsx

```typescript
// Getting org from API via useOrganization hook
const { useDefaultOrganization } = useOrganization();
const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
```

## Why This Was a Problem

1. **Different Org IDs**: localStorage could have org X, while API returns org Y
2. **Data Staleness**: localStorage never updates automatically
3. **Inconsistent State**: Different pages sent different org IDs to backend
4. **API Mismatch**: Confirmations/Orders used one org, Products/Customers used another

## The Fix

Updated ALL pages to use the **same pattern**:

### Files Modified:

1. `/dashboard/src/pages/ConfirmationsPage.tsx`
2. `/dashboard/src/pages/ConfirmationDetailsPage.tsx`
3. `/dashboard/src/pages/OrdersPage.tsx`
4. `/dashboard/src/pages/OrderDetailsPage.tsx`

### Changes Made:

```typescript
// REMOVED: localStorage-based organization loading ❌
// ADDED: useOrganization hook ✅
import { useOrganization } from '@/hooks/useOrganization';

const { useDefaultOrganization } = useOrganization();
const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
const organizationId = organization?.id;
```

## Benefits of the Fix

✅ **Consistency**: All modules now use the same source for organization data  
✅ **Fresh Data**: Organization info is fetched from API, always up-to-date  
✅ **Centralized Logic**: useOrganization hook manages all org-related queries  
✅ **Better Caching**: React Query handles caching and invalidation  
✅ **Type Safety**: Proper TypeScript types from the hook  

## API URL Pattern

All modules now consistently use:
```
/api/users/{userId}/organization/{orgId}/{resource}
```

Built via `buildOrgApiUrl()` utility from `/lib/apiUtils.ts`

## Testing Checklist

- [ ] Confirmations page loads correctly
- [ ] Confirmation details page loads correctly
- [ ] Organization ID matches across all pages
- [ ] Creating new confirmations works
- [ ] Adding orders to confirmations works
- [ ] Status updates work correctly
- [ ] No console errors related to org ID

## Related Files

- `/dashboard/src/hooks/useOrganization.ts` - Organization hook
- `/dashboard/src/lib/apiUtils.ts` - API URL builders
- `/dashboard/src/pages/CustomersPage.tsx` - Reference implementation
- `/dashboard/src/pages/ProductsPage.tsx` - Reference implementation
- `/dashboard/src/pages/OrdersPage.tsx` - Reference implementation

## Notes

- `localStorage.getItem('selectedOrganization')` is still used in `CreateOrganization.tsx` for storing the newly created org, which is correct for that specific use case
- `sessionStorage` is used for resuming incomplete organization setup, which is also correct
- The fix only affects the **runtime fetching** of organization data in active pages
