# Products Filters Update

## Summary

Updated the products filtering to properly send `category` and `status` filters through the `search` query parameter, as required by the Products API.

## Changes Made

### 1. Updated `useProducts` Hook (`dashboard/src/hooks/useProducts.ts`)

**Modified `buildProductSearchString` function:**
- Added `categoryId` parameter support → generates `category:{categoryId}` filter
- Added `isActive` parameter support → generates `status:1` or `status:0` filter
- Both filters are now included in the comma-separated search string

**Example search strings generated:**
```
// Text search only
name:*shampoo*,orderBy>name

// With category filter
category:uuid-123,name:*product*,orderBy>name

// With status filter (active only)
status:1,orderBy>name

// Combined filters
category:uuid-123,status:1,name:*shampoo*,orderBy>name
```

**Modified `fetchProducts` function:**
- Removed separate `categoryId` query parameter (was incorrect)
- Now passes `categoryId` and `isActive` to `buildProductSearchString`
- All filters are combined into a single `search` parameter

### 2. Updated API Documentation (`docs/apis/PRODUCTS_API.md`)

Added documentation for the new search filters:
- `category`: Filter by category ID (exact match)
- `status`: Filter by active status (1 = active, 0 = inactive)

Added examples showing how to use these filters in the search parameter.

## How It Works

### Filter Flow

1. User selects filters in the UI (category dropdown, status toggle)
2. Filters are stored in Zustand store (`useProductListStore`)
3. `useProducts` hook receives filters via props
4. `buildProductSearchString` converts filters to search syntax:
   - `filters.categoryId` → `category:{id}`
   - `filters.isActive` → `status:1` or `status:0`
5. All filters are joined with commas in the search parameter
6. API receives: `?search=category:uuid,status:1,name:*text*&page=1&pageSize=12`

### Filter Syntax

The search parameter uses a comma-separated list of filters:

```
filter1:value1,filter2:value2,filter3:value3
```

**Supported filters:**
- `name:*text*` - Text search with wildcards
- `description:*text*` - Description search with wildcards
- `code:01-123` - Code search with type
- `code:123` - Code search without type
- `category:uuid` - Category filter (exact match)
- `status:1` or `status:0` - Active status filter
- `orderBy>field` - Sort ascending
- `orderBy<field` - Sort descending

## Testing

To test the filters:

1. **Category Filter:**
   - Go to Products page
   - Select a category from the dropdown
   - Verify URL contains: `?search=category:{categoryId},...`
   - Verify only products from that category are shown

2. **Status Filter:**
   - Toggle between "All", "Active", "Inactive"
   - Verify URL contains: `?search=status:1,...` or `?search=status:0,...`
   - Verify correct products are shown

3. **Combined Filters:**
   - Select category + status + search text
   - Verify URL contains all filters: `?search=category:uuid,status:1,name:*text*,...`
   - Verify results match all criteria

4. **Clear Filters:**
   - Click "Clear filters" button
   - Verify all filters are removed
   - Verify all products are shown

## Backend Requirements

The backend must support these search filters:
- `category:{categoryId}` - Filter products by category ID
- `status:{0|1}` - Filter products by active status

These should be implemented in the Products API endpoint handler to parse the search parameter and apply the appropriate filters to the database query.

## Related Files

- `dashboard/src/hooks/useProducts.ts` - Products data fetching hook
- `dashboard/src/store/product-list-store.ts` - Filter state management
- `dashboard/src/components/products/ProductFilters.tsx` - Filter UI components
- `dashboard/src/components/products/CategoryFilter.tsx` - Category dropdown
- `dashboard/src/components/products/StatusFilter.tsx` - Status toggle
- `docs/apis/PRODUCTS_API.md` - API documentation
