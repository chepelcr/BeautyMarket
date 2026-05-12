# useDataApi Import Fix Summary

## Issue
Components were trying to import a non-existent `useDataApi` hook that returns an object with all data properties. The actual implementation in `useDataApi.ts` exports individual hooks like `useAllMeasurementUnits`, `useAllTaxes`, etc.

## Root Cause
The components were written expecting a single hook pattern:
```typescript
const { measurementUnits, taxTypes, saleConditions } = useDataApi();
```

But the actual implementation provides individual hooks:
```typescript
const { data: measurementUnits } = useAllMeasurementUnits();
const { data: taxTypes } = useAllTaxes({ iso_code: CountryISO.COSTA_RICA });
```

## Solution
Updated all components to use the correct individual hooks from `useDataApi.ts` with proper parameters.

## Files Fixed

### 1. GeneralTab.tsx
**Before:**
```typescript
import { useDataApi } from '@/hooks/useDataApi';
const { measurementUnits } = useDataApi();
```

**After:**
```typescript
import { useAllMeasurementUnits } from '@/hooks/useDataApi';
const { data: measurementUnits } = useAllMeasurementUnits();
```

### 2. DocumentTab.tsx
**Before:**
```typescript
import { useDataApi } from '@/hooks/useDataApi';
const { saleConditions } = useDataApi();
```

**After:**
```typescript
import { useAllSaleConditions } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
const { data: saleConditions } = useAllSaleConditions({ iso_code: CountryISO.COSTA_RICA });
```

### 3. DiscountsTab.tsx
**Before:**
```typescript
import { useDataApi } from '@/hooks/useDataApi';
const { discountTypes } = useDataApi();
```

**After:**
```typescript
import { useAllDiscountTypes } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
const { data: discountTypes } = useAllDiscountTypes({ iso_code: CountryISO.COSTA_RICA });
```

### 4. OtherTab.tsx
**Before:**
```typescript
import { useDataApi } from '@/hooks/useDataApi';
const { factoryTaxCharges } = useDataApi();
```

**After:**
```typescript
import { useAllFactoryTaxCharges } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
const { data: factoryTaxCharges } = useAllFactoryTaxCharges({ iso_code: CountryISO.COSTA_RICA });
```

### 5. TaxesTab.tsx
**Before:**
```typescript
import { useDataApi } from '@/hooks/useDataApi';
const { taxTypes, taxRates, taxFactors } = useDataApi();
```

**After:**
```typescript
import { useAllTaxes, useAllTaxRates, useAllTaxFactors } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
const { data: taxTypes } = useAllTaxes({ iso_code: CountryISO.COSTA_RICA });
const { data: taxRates } = useAllTaxRates({ iso_code: CountryISO.COSTA_RICA });
const { data: taxFactors } = useAllTaxFactors({ iso_code: CountryISO.COSTA_RICA });
```

### 6. LineDetailModal.tsx
**Before:**
```typescript
import { useDataApi } from '@/hooks/useDataApi';
const { taxTypes, taxRates, taxFactors, taxAmounts, factoryTaxCharges } = useDataApi();
```

**After:**
```typescript
import { useAllTaxes, useAllTaxRates, useAllTaxFactors, useAllTaxAmounts, useAllFactoryTaxCharges } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
const { data: taxTypes } = useAllTaxes({ iso_code: CountryISO.COSTA_RICA });
const { data: taxRates } = useAllTaxRates({ iso_code: CountryISO.COSTA_RICA });
const { data: taxFactors } = useAllTaxFactors({ iso_code: CountryISO.COSTA_RICA });
const { data: factoryTaxCharges } = useAllFactoryTaxCharges({ iso_code: CountryISO.COSTA_RICA });
// Note: taxAmounts is fetched per-tax in TaxesTab when needed
```

### 7. ReceiverTab.tsx
**Before:**
```typescript
import { useDataApi } from '@/hooks/useDataApi';
const { identificationTypes } = useDataApi();
```

**After:**
```typescript
import { useAllIdentifications } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
const { data: identificationTypes } = useAllIdentifications({ iso_code: CountryISO.COSTA_RICA });
```

### 8. ReferencesTab.tsx
**Before:**
```typescript
import { useDataApi } from '@/hooks/useDataApi';
const { referenceTypes, referenceCodes } = useDataApi();
```

**After:**
```typescript
import { useAllReferences, useAllReferenceCodes } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
const { data: referenceTypes } = useAllReferences({ iso_code: CountryISO.COSTA_RICA });
const { data: referenceCodes } = useAllReferenceCodes({ iso_code: CountryISO.COSTA_RICA });
```

## Key Changes

1. **Individual Hook Imports**: Changed from single `useDataApi` import to specific hook imports
2. **Data Destructuring**: Changed from `{ property }` to `{ data: property }` pattern
3. **ISO Code Parameter**: Added `{ iso_code: CountryISO.COSTA_RICA }` parameter to country-specific hooks
4. **CountryISO Import**: Added `import { CountryISO } from '@/lib/enums'` where needed

## Benefits of This Approach

1. **Type Safety**: Each hook has proper TypeScript types for parameters and return values
2. **React Query Integration**: Leverages React Query's caching, refetching, and loading states
3. **Granular Control**: Components only fetch the data they need
4. **Proper Stale Time**: Each hook can have its own cache configuration
5. **Document Version Context**: Hooks automatically inject document_version_id when needed via the dataApiClient

## Data API Service Architecture

The data is fetched through:
1. **dataApiClient** (`services/data-api/client.ts`) - Service class that makes API calls
2. **Individual Hooks** (`hooks/useDataApi.ts`) - React Query wrappers around dataApiClient methods
3. **Components** - Use individual hooks to fetch specific data

This follows the correct pattern of:
- Service layer handles HTTP requests
- Hook layer handles React Query integration
- Component layer consumes hooks

## Testing Checklist

- [ ] POS line detail modal opens without errors
- [ ] Tax selection works in line detail
- [ ] Discount selection works in line detail
- [ ] Measurement units load in general tab
- [ ] Factory tax charges load in other tab
- [ ] Checkout document tab loads sale conditions
- [ ] Checkout receiver tab loads identification types
- [ ] Checkout references tab loads reference types and codes
- [ ] All dropdowns populate correctly
- [ ] No console errors about missing exports
