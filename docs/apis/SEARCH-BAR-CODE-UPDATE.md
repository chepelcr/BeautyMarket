# Search Bar Code Update

## Summary

Added **code search** to the search bar's OR logic. The search bar now searches across 4 fields simultaneously:
- name
- description
- categoryName
- **code** (NEW)

## Change Made

### Updated `useProducts` Hook (`dashboard/src/hooks/useProducts.ts`)

**Before:**
```typescript
if (params.textSearch) {
  const searchTerm = params.textSearch;
  filters.push(`(name:${searchTerm},description:${searchTerm},categoryName:${searchTerm})`);
}
```

**After:**
```typescript
if (params.textSearch) {
  const searchTerm = params.textSearch;
  // Code search without type prefix searches all code types
  filters.push(`(name:${searchTerm},description:${searchTerm},categoryName:${searchTerm},code:${searchTerm})`);
}
```

## How It Works

### Search Query Format

When a user types in the search bar, the query is converted to:
```
(name:text,description:text,categoryName:text,code:text)
```

This uses **OR logic** - products are found if they match ANY of these fields.

### Code Search Behavior

The `code:text` filter searches **all code types** without requiring a type prefix:
- Searches codeTypeId 01 (Vendor)
- Searches codeTypeId 02 (Buyer)
- Searches codeTypeId 03 (Manufacturer/Barcode)
- Searches codeTypeId 04 (Internal)
- Searches codeTypeId 99 (Other)

### Examples

**Search: "PROD123"**
```
(name:PROD123,description:PROD123,categoryName:PROD123,code:PROD123)
```
Finds products where:
- Name contains "PROD123" OR
- Description contains "PROD123" OR
- Category name contains "PROD123" OR
- Any code (any type) contains "PROD123"

**Search: "7501234567890"** (Barcode)
```
(name:7501234567890,description:7501234567890,categoryName:7501234567890,code:7501234567890)
```
Finds products where:
- Name contains "7501234567890" OR
- Description contains "7501234567890" OR
- Category name contains "7501234567890" OR
- Any code (including barcode type 03) contains "7501234567890"

**Search: "shampoo"**
```
(name:shampoo,description:shampoo,categoryName:shampoo,code:shampoo)
```
Finds products where:
- Name contains "shampoo" OR
- Description contains "shampoo" OR
- Category name contains "shampoo" OR
- Any code contains "shampoo"

## Use Cases

### 1. Quick Product Lookup by Code
User can type any product code (vendor, internal, barcode) directly in the search bar without needing to know the code type.

**Example:**
- Type: "VENDOR001"
- Finds: Product with vendor code "VENDOR001"

### 2. Barcode Search
User can scan or type a barcode to find the product.

**Example:**
- Type: "7501234567890"
- Finds: Product with barcode "7501234567890"

### 3. Internal Code Search
User can search by internal SKU or product code.

**Example:**
- Type: "SKU-12345"
- Finds: Product with internal code "SKU-12345"

### 4. Flexible Search
User doesn't need to remember if something is a code, name, or category - just type and find.

**Example:**
- Type: "organic"
- Finds: Products with "organic" in name, description, category, OR code

## Benefits

✅ **Faster product lookup** - No need to know code type
✅ **Barcode scanning** - Direct barcode search support
✅ **Unified search** - One search box for everything
✅ **Better UX** - Users don't need to understand code types
✅ **Flexible** - Works with any code format

## API Query

The generated search string is sent to the API:
```
GET /api/organizations/{orgId}/products?search=(name:text,description:text,categoryName:text,code:text)&page=1&pageSize=12
```

The backend parses the `code:text` filter and searches across all code types in the JSONB codes array.

## Testing

### Test Cases

1. **Search by vendor code:**
   - Input: "VENDOR001"
   - Expected: Products with vendor code containing "VENDOR001"

2. **Search by barcode:**
   - Input: "7501234567890"
   - Expected: Products with barcode "7501234567890"

3. **Search by internal code:**
   - Input: "SKU-12345"
   - Expected: Products with internal code "SKU-12345"

4. **Search by partial code:**
   - Input: "PROD"
   - Expected: Products with any code containing "PROD"

5. **Search finds product by name:**
   - Input: "shampoo"
   - Expected: Products with "shampoo" in name, description, category, or code

6. **Combined with filters:**
   - Input: "PROD" + Category filter + Status filter
   - Expected: Filtered products with "PROD" in any field

## Related Documentation

- `docs/apis/PRODUCT_SEARCH_GUIDE.md` - Complete search syntax guide
- `docs/apis/PRODUCT-SEARCH-IMPLEMENTATION.md` - Full implementation details
- `dashboard/src/hooks/useProducts.ts` - Search logic implementation
