# Product Search Implementation

## Overview

Implemented comprehensive product search and filtering based on the Product Search Guide. The implementation supports:

- **Text search with OR logic** across name, description, categoryName, and code
- **Category filtering** by ID
- **Status filtering** (active/inactive)
- **Price range filtering** (min, max, or between)
- **Sale price range filtering** (min, max, or between)
- **Sorting** by multiple fields
- **Automatic partial matching** for text fields (no wildcards needed)

---

## Changes Made

### 1. Updated `useProducts` Hook (`dashboard/src/hooks/useProducts.ts`)

**Enhanced `buildProductSearchString` function:**

```typescript
function buildProductSearchString(params: {
  textSearch?: string;
  categoryId?: string;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  salePriceMin?: number;
  salePriceMax?: number;
  sortBy?: string;
  sortOrder?: string;
}): string
```

**Key Features:**

1. **Text Search with OR Logic:**
   - Searches across name, description, categoryName, and code simultaneously
   - Uses parentheses for OR: `(name:text,description:text,categoryName:text,code:text)`
   - Automatic partial matching (no wildcards needed!)
   - Code search without type prefix searches all code types
   - Example: `(name:shampoo,description:shampoo,categoryName:shampoo,code:shampoo)`

2. **Category Filter:**
   - Exact match by category ID
   - Example: `categoryId:uuid-123`

3. **Status Filter:**
   - Active (1) or Inactive (0)
   - Example: `status:1`

4. **Price Filters:**
   - Between range: `price:50~150`
   - Greater than: `price>50`
   - Less than: `price<150`

5. **Sale Price Filters:**
   - Between range: `salePrice:50~150`
   - Greater than: `salePrice>50`
   - Less than: `salePrice<150`

6. **Sorting:**
   - Ascending: `orderBy>field`
   - Descending: `orderBy<field`

**Example Generated Search Strings:**

```
// Text search only (searches name, description, categoryName, code)
(name:shampoo,description:shampoo,categoryName:shampoo,code:shampoo),orderBy>name

// With category filter
categoryId:uuid-123,(name:product,description:product,categoryName:product,code:product),orderBy>name

// With status and price range
status:1,price:50~150,orderBy>price

// Combined filters
categoryId:uuid-123,status:1,price:50~150,(name:organic,description:organic,categoryName:organic,code:organic),orderBy>name
```

### 2. Updated Product Filters Store (`dashboard/src/store/product-list-store.ts`)

**Added new filter fields:**

```typescript
export interface ProductFilters {
  categoryId?: string;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  salePriceMin?: number;      // NEW
  salePriceMax?: number;      // NEW
}
```

### 3. Created Advanced Filters Component (`dashboard/src/components/products/AdvancedFilters.tsx`)

**New component for price filtering:**

- Popover-based UI for advanced filters
- Price range inputs (min/max)
- Sale price range inputs (min/max)
- Apply and clear functionality
- Badge showing active filter count
- Responsive design

**Features:**
- Min only: Greater than filter (`price>50`)
- Max only: Less than filter (`price<150`)
- Both: Between range filter (`price:50~150`)
- Same logic for sale price

### 4. Updated Product Filters Component (`dashboard/src/components/products/ProductFilters.tsx`)

**Added AdvancedFilters component:**
- Integrated into the filter bar
- Shows active filter count
- Included in "Clear all" functionality

### 5. Added Translation Keys

**English:**
```typescript
'products.filters.advanced': 'Advanced',
'products.filters.advancedTitle': 'Advanced Filters',
'products.filters.price': 'Price',
'products.filters.salePrice': 'Sale Price',
'products.filters.min': 'Min',
'products.filters.max': 'Max',
'products.filters.apply': 'Apply Filters',
'products.filters.clearAll': 'Clear All',
```

**Spanish:**
```typescript
'products.filters.advanced': 'Avanzado',
'products.filters.advancedTitle': 'Filtros Avanzados',
'products.filters.price': 'Precio',
'products.filters.salePrice': 'Precio de Venta',
'products.filters.min': 'Mín',
'products.filters.max': 'Máx',
'products.filters.apply': 'Aplicar Filtros',
'products.filters.clearAll': 'Limpiar Todo',
```

---

## How It Works

### Search Flow

1. **User enters text in search bar:**
   - Text is stored in `searchQuery` state
   - Debounced by 500ms
   - Converted to OR search: `(name:text,description:text,categoryName:text,code:text)`
   - Code search without type prefix searches all code types (01, 02, 03, 04, 99)

2. **User selects category:**
   - Stored in `filters.categoryId`
   - Added as: `categoryId:uuid`

3. **User selects status:**
   - Stored in `filters.isActive`
   - Added as: `status:1` or `status:0`

4. **User sets price filters:**
   - Opens Advanced Filters popover
   - Sets min/max for price or sale price
   - Stored in `filters.priceMin`, `filters.priceMax`, etc.
   - Converted to:
     - Both: `price:50~150`
     - Min only: `price>50`
     - Max only: `price<150`

5. **All filters combined:**
   - Joined with commas (AND logic)
   - Example: `(name:shampoo,description:shampoo,categoryName:shampoo,code:shampoo),categoryId:uuid,status:1,price:50~150,orderBy>name`

6. **API request:**
   - `GET /api/organizations/{orgId}/products?search={searchString}&page=1&pageSize=12`

### Filter Syntax Examples

**Text search (OR logic):**
```
(name:shampoo,description:shampoo,categoryName:shampoo,code:shampoo)
```
Finds products where name OR description OR categoryName OR code contains "shampoo"

**Category + Status:**
```
categoryId:cat-123,status:1
```
Finds active products in category cat-123

**Price range:**
```
price:50~150
```
Finds products priced between 50 and 150

**Price minimum:**
```
price>50
```
Finds products priced over 50

**Price maximum:**
```
price<150
```
Finds products priced under 150

**Combined:**
```
(name:organic,description:organic,categoryName:organic,code:organic),categoryId:cat-123,status:1,price:50~150,orderBy>name
```
Finds active products in category cat-123, priced 50-150, where name/description/category/code contains "organic", sorted by name

---

## UI Components

### Search Bar
- Located at top of products page
- Searches across name, description, categoryName, and code
- Code search without type prefix searches all code types
- Automatic partial matching (no wildcards needed)
- Debounced by 500ms

### Category Filter
- Dropdown select
- Shows all categories
- "All categories" option to clear

### Status Filter
- Dropdown select
- Options: All, Active, Inactive
- "All" option to clear

### Advanced Filters (NEW)
- Popover button with slider icon
- Shows badge with active filter count
- Contains:
  - Price min/max inputs
  - Sale price min/max inputs
  - Apply button
  - Clear all button
- Responsive design

### Clear Filters Button
- Shows when any filter is active
- Clears all filters at once
- Resets to page 1

---

## API Integration

### Request Format

```
GET /api/organizations/{orgId}/products?search={searchString}&page={page}&pageSize={pageSize}
```

### Search String Format

Comma-separated filters (AND logic):
```
filter1:value1,filter2:value2,filter3:value3
```

OR logic with parentheses:
```
(filter1:value1,filter2:value2)
```

### Supported Filters

| Filter | Format | Example |
|--------|--------|---------|
| Text search (OR) | `(name:text,description:text,categoryName:text,code:text)` | `(name:shampoo,description:shampoo,categoryName:shampoo,code:shampoo)` |
| Category ID | `categoryId:uuid` | `categoryId:cat-123` |
| Status | `status:0\|1` | `status:1` |
| Price between | `price:min~max` | `price:50~150` |
| Price greater | `price>value` | `price>50` |
| Price less | `price<value` | `price<150` |
| Sale price between | `salePrice:min~max` | `salePrice:50~150` |
| Sale price greater | `salePrice>value` | `salePrice>50` |
| Sale price less | `salePrice<value` | `salePrice<150` |
| Sort ascending | `orderBy>field` | `orderBy>name` |
| Sort descending | `orderBy<field` | `orderBy<price` |

---

## Testing Checklist

### Text Search
- [x] Search by product name
- [x] Search by description
- [x] Search by category name
- [x] Search by product code (all code types)
- [x] Verify OR logic (finds products matching any field)
- [x] Verify automatic partial matching (no wildcards needed)

### Category Filter
- [x] Filter by specific category
- [x] Clear category filter
- [x] Combine with text search

### Status Filter
- [x] Show only active products
- [x] Show only inactive products
- [x] Show all products
- [x] Combine with other filters

### Price Filters
- [x] Set minimum price only
- [x] Set maximum price only
- [x] Set price range (min and max)
- [x] Clear price filters
- [x] Combine with other filters

### Sale Price Filters
- [x] Set minimum sale price only
- [x] Set maximum sale price only
- [x] Set sale price range (min and max)
- [x] Clear sale price filters
- [x] Combine with other filters

### Combined Filters
- [x] Text + Category + Status
- [x] Text + Price range
- [x] Category + Status + Price
- [x] All filters together
- [x] Clear all filters

### Sorting
- [x] Sort by name (A-Z, Z-A)
- [x] Sort by price (low-high, high-low)
- [x] Sort with filters applied

### UI/UX
- [x] Advanced filters popover opens/closes
- [x] Badge shows active filter count
- [x] Clear all button works
- [x] Filters persist during navigation
- [x] Loading states work correctly
- [x] Empty states show when no results

---

## Performance Considerations

1. **Debounced Search:**
   - 500ms delay prevents excessive API calls
   - User can type freely without lag

2. **Efficient Queries:**
   - Backend uses indexed fields for fast lookups
   - Text search uses database LIKE with indexes
   - Price filters use numeric comparisons

3. **Pagination:**
   - Default 12 items per page
   - Prevents loading too much data
   - User can adjust page size

4. **Filter Combinations:**
   - All filters are AND-ed together
   - Reduces result set size
   - Faster queries

---

## Future Enhancements

Potential improvements:

1. **Code Search:**
   - Add code filter to advanced filters
   - Support code type selection
   - Example: `code:01-VENDOR123`

2. **Date Filters:**
   - Add created date range
   - Add updated date range
   - Example: `createdOn:2024-01-01~2024-12-31`

3. **Saved Filters:**
   - Allow users to save filter combinations
   - Quick access to common searches
   - Share filters with team

4. **Filter Presets:**
   - "Low stock" preset
   - "New products" preset
   - "High value" preset

5. **Export Filtered Results:**
   - Export current filtered view to Excel
   - Include all applied filters in export

6. **Advanced Text Search:**
   - Support for exact phrase matching
   - Exclude terms (NOT logic)
   - Regular expressions

---

## Related Files

- `dashboard/src/hooks/useProducts.ts` - Products data fetching and search logic
- `dashboard/src/store/product-list-store.ts` - Filter state management
- `dashboard/src/components/products/ProductFilters.tsx` - Main filter bar
- `dashboard/src/components/products/AdvancedFilters.tsx` - Advanced price filters
- `dashboard/src/components/products/CategoryFilter.tsx` - Category dropdown
- `dashboard/src/components/products/StatusFilter.tsx` - Status dropdown
- `dashboard/src/components/products/ProductSearch.tsx` - Search input
- `dashboard/src/pages/ProductsPage.tsx` - Products page layout
- `docs/apis/PRODUCT_SEARCH_GUIDE.md` - Complete API search documentation

---

## API Documentation Reference

See `docs/apis/PRODUCT_SEARCH_GUIDE.md` for complete API documentation including:
- All available filters
- Operator reference
- Wildcard patterns
- OR logic with parentheses
- Complex query examples
- Performance tips
