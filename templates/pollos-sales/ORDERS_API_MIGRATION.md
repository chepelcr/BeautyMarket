# Orders API Migration - Pollos Sales

## Summary
Updated pollos-sales to use the same **Orders API** (`cross-app-be` service) as the main dashboard for product management, ensuring consistency across the platform.

## Background

The BeautyMarket platform uses **two separate backend services**:

1. **Markets API** (`markets-api.jcampos.dev`) - Main API for:
   - User authentication and profiles
   - Organization management
   - Memberships
   - Website building (pages, sections, deployments)
   - Settings (theme, contact, payment, shipping)

2. **Orders API** (`orders-api.jcampos.dev`) - Cross-app backend (`cross-app-be`) for:
   - Products
   - Categories
   - Orders
   - Clients
   - Confirmations
   - Inventory management

## Changes Made

### 1. Updated Environment Configuration
**File**: `.env`

Added Orders API URL:
```env
VITE_ORDERS_API_URL=https://orders-api.jcampos.dev
```

### 2. Enhanced API Library
**File**: `src/lib/api.ts`

**Added**:
- `ORDERS_API_BASE` constant from environment variable
- `ordersApi` object with methods: `get`, `post`, `patch`, `delete`
- `ordersOrgPath()` helper function for building Orders API URLs
- Updated `request()` function to accept custom `baseUrl` parameter

**API Path Patterns**:
- **Markets API**: `/api/users/{userId}/organization/{orgId}/{endpoint}`
- **Orders API**: `/api/organizations/{orgId}/{endpoint}` ✅ (simpler, no userId)

### 3. Updated useProducts Hook
**File**: `src/hooks/useProducts.ts`

**Changed**:
- From: `api.get(orgPath(user!.userId, org!.id, "/products"))`
- To: `ordersApi.get(ordersOrgPath(org!.id, "/products"))`

**Benefits**:
- Uses correct Orders API service
- Simpler URL pattern (no userId needed)
- Matches dashboard implementation

### 4. Updated ProductsPage
**File**: `src/pages/dashboard/ProductsPage.tsx`

**Changed all API calls**:
- Fetch products: `ordersApi.get(ordersOrgPath(org!.id, "/products"))`
- Update price: `ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}`), { price })`
- Toggle active: `ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}`), { isActive })`
- Create product: `ordersApi.post(ordersOrgPath(org!.id, "/products"), { ... })`

## API Endpoint Comparison

### Before (Incorrect)
```
Markets API: https://markets-api.jcampos.dev
Endpoint: /api/users/{userId}/organization/{orgId}/products
```
❌ This endpoint doesn't exist on Markets API

### After (Correct)
```
Orders API: https://orders-api.jcampos.dev
Endpoint: /api/organizations/{orgId}/products
```
✅ Matches dashboard implementation

## Dashboard Pattern Reference

The dashboard uses the same pattern in `src/hooks/useOrders.ts`:

```typescript
const ORDERS_API_BASE_URL = import.meta.env.VITE_ORDERS_API_URL;

export function buildOrdersApiUrl(organizationId: string, endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${ORDERS_API_BASE_URL}/api/organizations/${organizationId}${cleanEndpoint}`;
}
```

## Service Separation

### Markets API Endpoints (User/Org Management)
- `/api/users/{userId}/profile`
- `/api/users/{userId}/organizations`
- `/api/users/{userId}/memberships/organizations`
- `/api/users/{userId}/organization/{orgId}/deployments`
- `/api/users/{userId}/organization/{orgId}/pages`
- `/api/users/{userId}/organization/{orgId}/settings/*`

### Orders API Endpoints (Business Data)
- `/api/organizations/{orgId}/products` ✅
- `/api/organizations/{orgId}/categories`
- `/api/organizations/{orgId}/orders`
- `/api/organizations/{orgId}/clients`
- `/api/organizations/{orgId}/confirmations`

## Benefits

1. **Correct Service**: Products now use the Orders API service
2. **Consistent with Dashboard**: Same API pattern as main dashboard
3. **Simpler URLs**: No userId needed in Orders API paths
4. **Proper Separation**: User management vs business data
5. **Scalability**: Orders API can scale independently

## Testing Checklist

- [ ] Products page loads without errors
- [ ] Can fetch products list
- [ ] Can create new product
- [ ] Can update product price
- [ ] Can toggle product active status
- [ ] Network tab shows requests to `orders-api.jcampos.dev`
- [ ] No requests to `/products` on `markets-api.jcampos.dev`

## Future Migrations

Other pollos-sales features that should use Orders API:
- [ ] Sales/Orders management
- [ ] Inventory tracking
- [ ] Client/Customer management
- [ ] Categories (if implemented)

## Related Files

- `.env` (added VITE_ORDERS_API_URL)
- `src/lib/api.ts` (added ordersApi and ordersOrgPath)
- `src/hooks/useProducts.ts` (migrated to Orders API)
- `src/pages/dashboard/ProductsPage.tsx` (migrated to Orders API)

## Notes

- The Orders API (`cross-app-be`) is a FastAPI service separate from the main Express.js Markets API
- Both services use the same JWT authentication (AWS Cognito)
- The Orders API has a simpler URL structure (no userId in path)
- This migration aligns pollos-sales with the dashboard's architecture
