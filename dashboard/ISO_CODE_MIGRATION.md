# ISO Code Migration: CR → 188

## Summary
Changed all default country ISO code values from "CR" (alpha-2 code) to "188" (numeric code) across the dashboard application. This ensures consistency with the data API which uses ISO numeric codes.

## Changes Made

### 1. Core Application Files

#### `dashboard/src/App.tsx`
- Changed default ISO code from "CR" to "188" in organization context

#### `dashboard/src/hooks/useDocumentVersion.ts`
- Changed default ISO code from "CR" to "188" in document version hook

### 2. Customer Form Components

#### `dashboard/src/components/customers/CustomerForm.tsx`
- Changed default ISO code from "CR" to "188" in isoCode useMemo
- Changed default nationality from "CR" to "188" in form defaultValues
- Updated comment to reflect "188" as default

#### `dashboard/src/components/customers/sections/PersonalDataSection.tsx`
- Changed comparison from `=== "CR"` to `=== "188"` for isCostaRica check
- Changed comparison from `!== "CR"` to `!== "188"` in identification type filtering
- Changed comparison from `!== "CR"` to `!== "188"` in auto-select logic

#### `dashboard/src/components/customers/sections/LocationSection.tsx`
- Changed comparison from `=== "CR"` to `=== "188"` for isCostaRica check

### 3. Product Form Components

#### `dashboard/src/components/admin/product-form.tsx`
- Changed default ISO code from "CR" to "188" in CodesSection prop
- Changed default ISO code from "CR" to "188" in DiscountsSection prop
- Changed default ISO code from "CR" to "188" in AdvancedTaxesSection prop

#### `dashboard/src/components/products/sections/CodesSection.tsx`
- Changed default parameter value from `isoCode = "CR"` to `isoCode = "188"`

#### `dashboard/src/components/products/sections/DiscountsSection.tsx`
- Changed default parameter value from `isoCode = "CR"` to `isoCode = "188"`

#### `dashboard/src/components/products/sections/AdvancedTaxesSection.tsx`
- Changed default parameter value from `isoCode = "CR"` to `isoCode = "188"`

## Impact

### Positive
- Consistency with data API which uses ISO numeric codes
- All reference data (document types, countries, states, counties, districts, codes, discounts, taxes) now use consistent ISO code format
- React Query caching works correctly with numeric ISO codes

### No Breaking Changes
- The organization model still needs the `organization_country` field to be added
- All components use `@ts-ignore` comments for the missing field
- Default behavior remains the same (Costa Rica), just using numeric code instead of alpha-2 code

## Testing Recommendations

1. Test customer form with Costa Rican nationality (188)
2. Test customer form with foreign nationality
3. Test product form sections (codes, discounts, taxes) with default organization
4. Verify cascading location selectors work correctly
5. Verify document version prefetching on app load
6. Test organization context changes trigger proper refetching

## Related Documentation
- `dashboard/ORGANIZATION_CONTEXT_CHANGE_HANDLING.md` - Organization context change handling
- `.kiro/specs/data-service-form-integration/tasks.md` - Original spec tasks
