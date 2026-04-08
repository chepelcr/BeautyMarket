# Organization Context Change Handling

## Overview

This document explains how forms automatically refetch reference data when the organization context changes (e.g., when a user switches between organizations).

## Implementation Pattern

### How It Works

The organization context change handling leverages **React Query's automatic refetching** when query keys change. Here's the flow:

1. **Organization Context**: The current organization is stored in `sessionStorage['selectedOrgId']` and accessed via `useDefaultOrganization(user?.id)` hook
2. **ISO Code Derivation**: Each form derives the ISO code from the organization's `organization_country` field using `useMemo`
3. **Query Key Dependency**: All data API hooks include the ISO code in their query keys
4. **Automatic Refetch**: When the organization changes, the ISO code changes, query keys change, and React Query automatically refetches all affected data

### Code Example

```typescript
// In CustomerForm.tsx
const { useDefaultOrganization } = useOrganization();
const { data: defaultOrg } = useDefaultOrganization(user?.id);

// ISO code is derived from organization - when org changes, this recalculates
const isoCode = useMemo(() => {
  return defaultOrg?.organization_country || "CR";
}, [defaultOrg]);

// All hooks use isoCode in their query keys
const { data: documentTypes } = useAllDocumentTypes({ iso_code: isoCode });
const { data: countries } = useAllCountries();
const { data: states } = useStates({ iso_code: isoCode });
// ... etc
```

### Components with Organization Context Handling

#### CustomerForm
- **Location**: `dashboard/src/components/customers/CustomerForm.tsx`
- **ISO Code Source**: `defaultOrg?.organization_country || "CR"`
- **Affected Hooks**:
  - `useAllDocumentTypes({ iso_code: isoCode })`
  - `useAllCustomerTypes()`
  - `useAllCountries()`
  - `useStates({ iso_code: isoCode })`
  - `useCounties({ iso_code: isoCode, state_id })`
  - `useDistricts({ iso_code: isoCode, state_id, county_id })`

#### ProductForm Sections

##### CodesSection
- **Location**: `dashboard/src/components/products/sections/CodesSection.tsx`
- **ISO Code Source**: Passed as prop from ProductForm
- **Affected Hooks**:
  - `useAllCodes({ iso_code: isoCode })`

##### DiscountsSection
- **Location**: `dashboard/src/components/products/sections/DiscountsSection.tsx`
- **ISO Code Source**: Passed as prop from ProductForm
- **Affected Hooks**:
  - `useAllDiscountTypes({ iso_code: isoCode })`

##### AdvancedTaxesSection
- **Location**: `dashboard/src/components/products/sections/AdvancedTaxesSection.tsx`
- **ISO Code Source**: Passed as prop from ProductForm
- **Affected Hooks**:
  - `useAllTaxes({ iso_code: isoCode })`
  - `useAllTaxRates({ iso_code: isoCode })`

## React Query Configuration

The data API hooks are configured with appropriate `staleTime` values to balance performance and data freshness:

- **Document Types**: 5 minutes
- **Countries**: 1 hour
- **Location Data**: 10 minutes
- **Codes, Discounts, Taxes**: 5 minutes

When the organization changes and query keys update, React Query will:
1. Immediately mark the old data as stale
2. Fetch new data with the updated ISO code
3. Update the UI with the new data
4. Cache the new data for future use

## Testing Organization Context Changes

To test organization context change handling:

1. **Login** with a user that has access to multiple organizations
2. **Open a form** (CustomerForm or ProductForm)
3. **Switch organizations** using the organization selector
4. **Verify** that:
   - Reference data dropdowns update with data for the new organization
   - Loading indicators appear briefly during refetch
   - No errors occur during the transition
   - Form state is preserved (if applicable)

## Edge Cases Handled

### Missing Organization Context
- **Scenario**: User context or organization context is unavailable
- **Handling**: Default to "CR" (Costa Rica) as the ISO code
- **Code**: `defaultOrg?.organization_country || "CR"`

### Null or Undefined organization_country
- **Scenario**: Organization exists but `organization_country` field is null/undefined
- **Handling**: Default to "CR" (Costa Rica)
- **Code**: Same as above with optional chaining

### Organization Change During Form Submission
- **Scenario**: User switches organizations while a form is being submitted
- **Handling**: Form submission uses the organization context at the time of submission
- **Note**: This is handled by the form submission logic, not the refetch mechanism

## Performance Considerations

### Minimal Refetches
- React Query deduplicates concurrent requests for the same data
- Cached data is reused when switching back to a previously selected organization
- Only data with changed query keys is refetched

### Non-Blocking UI
- Forms render immediately without waiting for reference data
- Loading states are shown for individual fields
- Users can interact with non-dependent fields during refetch

### Cascading Selectors
- Location selectors (state → county → district) only fetch when parent is selected
- Conditional fetching prevents unnecessary API calls
- Child selectors are disabled until parent data is loaded

## Future Enhancements

### Potential Improvements
1. **Optimistic Updates**: Pre-load reference data for all user organizations on login
2. **Background Sync**: Periodically sync reference data in the background
3. **Offline Support**: Cache reference data for offline use
4. **Migration Path**: Add database migration to populate `organization_country` field for existing organizations

### Database Schema
The `organization_country` field should be added to the organizations table:

```sql
ALTER TABLE organizations 
ADD COLUMN organization_country VARCHAR(2) 
REFERENCES countries(iso_code) 
DEFAULT 'CR' 
NOT NULL;
```

## Related Documentation

- **Design Document**: `.kiro/specs/data-service-form-integration/design.md`
- **Requirements**: `.kiro/specs/data-service-form-integration/requirements.md`
- **Tasks**: `.kiro/specs/data-service-form-integration/tasks.md`
- **Data API Client**: `dashboard/src/services/data-api/client.ts`
- **Data API Hooks**: `dashboard/src/hooks/useDataApi.ts`
