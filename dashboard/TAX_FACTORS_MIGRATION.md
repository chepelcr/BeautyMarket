# Tax Factors Migration to Data API

## Overview
Migrated tax factors from organization-specific API to the centralized data API service.

## Changes Made

### 1. Type Definitions Fixed
**File**: `dashboard/src/services/data-api/dtos/taxes.ts`

Made `document_version_id` optional in:
- `GetAllTaxesParams`
- `GetAllTaxRatesParams`

This allows the data API client to automatically inject the document version ID without requiring it in every hook call.

### 2. AdvancedTaxesSection Updated
**File**: `dashboard/src/components/products/sections/AdvancedTaxesSection.tsx`

**Before**:
```typescript
// Tax factors fetched from organization API
const { data: taxFactors = [] } = useAllTaxFactors({
  iso_code: isoCode
});
```

**After**:
```typescript
// Fetch tax factors from data API (document_version_id is automatically injected)
const { data: dataApiTaxFactors, isError: taxFactorsError } = useAllTaxFactors({
  iso_code: isoCode
});

// Fallback to organization-specific API if data API fails
const { data: orgTaxFactors } = useQuery<any[]>({
  queryKey: ["taxFactors", user?.id, defaultOrg?.id],
  queryFn: async (): Promise<any[]> => {
    if (!user?.id || !defaultOrg?.id) return [];
    const res = await apiRequest("GET", buildOrgApiUrl(user.id, defaultOrg.id, "/catalogs/tax-factors"));
    return res.json();
  },
  enabled: taxFactorsError && !!user?.id && !!defaultOrg?.id,
});

// Use data API data if available, otherwise fall back to org API data
const taxFactors = dataApiTaxFactors || orgTaxFactors || [];
```

## Benefits

1. **Centralized Data**: Tax factors now come from the centralized data API service
2. **Automatic Document Version**: The document version ID is automatically injected by the client
3. **Fallback Support**: If data API fails, falls back to organization-specific API
4. **Consistent Pattern**: Follows the same pattern as taxes and tax rates

## API Endpoint

**Data API**: `GET /countries/{iso_code}/tax-factors/all`
- Country-scoped endpoint
- No document_version_id required (automatically injected)

## Related Files

- `dashboard/src/hooks/useDataApi.ts` - Contains `useTaxFactor` and `useAllTaxFactors` hooks
- `dashboard/src/services/data-api/client.ts` - Contains `getTaxFactor` and `getAllTaxFactors` methods
- `data-services/app/tax-factors/src/controllers/tax_factors_controller.py` - Backend endpoint

## Testing

Verify that:
1. Tax factors load correctly in the AdvancedTaxesSection
2. Document version ID is automatically included in requests
3. Fallback to organization API works if data API fails
4. No TypeScript errors in the component
