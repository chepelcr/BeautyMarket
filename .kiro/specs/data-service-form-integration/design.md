# Design Document: Data Service Form Integration

## Overview

This design integrates the existing data API service with CustomerForm and ProductForm components to replace hardcoded reference data with dynamic data from the centralized data API. The integration leverages the existing `useDataApi` hooks that wrap React Query for efficient caching, loading states, and error handling.

The key architectural principle is to maintain the existing hook abstraction layer rather than calling the data API client directly. This ensures consistent caching behavior, automatic refetching, and standardized error handling across all form components.

### Goals

- Replace all hardcoded reference data (document types, countries, locations, codes, discounts, taxes) with dynamic API data
- Implement cascading location selectors with proper state management
- Provide clear loading and error states for all reference data
- Optimize performance through React Query caching
- Support organization-specific ISO code context
- Maintain backward compatibility with existing form validation and submission logic

### Non-Goals

- Modifying the data API client or hook implementations
- Changing form validation rules or submission logic
- Altering the visual design of forms
- Adding new reference data types beyond what's already available

## Architecture

### Component Integration Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                      Form Component                          │
│  (CustomerForm / ProductForm / Product Sections)            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. Determine ISO code from organization context   │    │
│  │  2. Call useDataApi hooks with ISO code            │    │
│  │  3. Handle loading/error states                    │    │
│  │  4. Render form fields with dynamic data           │    │
│  │  5. Manage cascading dependencies (locations)      │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   useDataApi Hooks                           │
│              (dashboard/src/hooks/useDataApi.ts)            │
│                                                              │
│  - useAllDocumentTypes()                                    │
│  - useAllCountries()                                        │
│  - useStates(iso_code)                                      │
│  - useCounties(iso_code, state_id)                          │
│  - useDistricts(iso_code, state_id, county_id)             │
│  - useNeighborhoods(iso_code, state_id, county_id,         │
│                      district_id)                           │
│  - useAllCodes(iso_code)                                    │
│  - useAllDiscountTypes(iso_code)                            │
│  - useAllTaxes(iso_code)                                    │
│  - useAllTaxRates(iso_code)                                 │
│                                                              │
│  Returns: { data, isLoading, isError, error, refetch }     │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Query Layer                           │
│  - Automatic caching with staleTime                         │
│  - Deduplication of concurrent requests                     │
│  - Background refetching                                    │
│  - Query invalidation                                       │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data API Client                             │
│         (dashboard/src/services/data-api/client.ts)         │
│  - Constructs API URLs                                      │
│  - Makes HTTP requests                                      │
│  - Returns typed responses                                  │
└───────────────────────────────────────────────────────────────┘
```

### Cascading Location Selector Pattern

The location hierarchy (Country → State → County → District → Neighborhood) requires careful state management to ensure child selectors are properly enabled/disabled and cleared when parent selections change.

```
┌──────────────────────────────────────────────────────────────┐
│  Location Selection Flow                                     │
│                                                               │
│  1. User selects Country                                     │
│     ├─ Clear: state, county, district, neighborhood         │
│     ├─ Disable: county, district, neighborhood              │
│     └─ Fetch: states for selected country                   │
│                                                               │
│  2. User selects State                                       │
│     ├─ Clear: county, district, neighborhood                │
│     ├─ Disable: district, neighborhood                      │
│     └─ Fetch: counties for selected state                   │
│                                                               │
│  3. User selects County                                      │
│     ├─ Clear: district, neighborhood                        │
│     ├─ Disable: neighborhood                                │
│     └─ Fetch: districts for selected county                 │
│                                                               │
│  4. User selects District                                    │
│     ├─ Clear: neighborhood                                  │
│     └─ Fetch: neighborhoods for selected district           │
│                                                               │
│  5. User selects Neighborhood                                │
│     └─ Complete                                             │
└──────────────────────────────────────────────────────────────┘
```

### ISO Code Resolution Strategy

Forms need to determine the appropriate ISO code for data API requests:

1. Use organization's `organization_country` field (foreign key to countries.iso_code)
2. If not available, default to "CR" (Costa Rica)
3. Pass ISO code to all hooks that require it
4. React to organization context changes by refetching data

**Database Schema**:
```sql
-- Organization table
ALTER TABLE organizations 
ADD COLUMN organization_country VARCHAR(2) 
REFERENCES countries(iso_code) 
DEFAULT 'CR' 
NOT NULL;
```

## Components and Interfaces

### CustomerForm Integration

**Modified Component**: `dashboard/src/components/customers/CustomerForm.tsx`

**New Props**:
```typescript
interface CustomerFormProps {
  onSubmit: (data: CreateClientData) => void;
  initialData?: Partial<CreateClientData>;
  isLoading?: boolean;
  organizationIsoCode?: string; // ISO code from organization context
}
```

**Hook Usage**:
```typescript
// Get ISO code from organization
const isoCode = useMemo(() => {
  return organization?.organizationCountry || "CR";
}, [organization]);

// Document types for identification
const { data: documentTypes, isLoading: documentTypesLoading, isError: documentTypesError } = 
  useAllDocumentTypes({ iso_code: isoCode });

// Countries for nationality
const { data: countries, isLoading: countriesLoading } = 
  useAllCountries();

// Cascading location selectors
const selectedCountry = form.watch("nationality");
const selectedState = form.watch("residence.stateId");
const selectedCounty = form.watch("residence.countyId");
const selectedDistrict = form.watch("residence.districtId");

const { data: states, isLoading: statesLoading } = 
  useStates({ iso_code: isoCode }, { enabled: !!selectedCountry });

const { data: counties, isLoading: countiesLoading } = 
  useCounties(
    { iso_code: isoCode, state_id: selectedState }, 
    { enabled: !!selectedState }
  );

const { data: districts, isLoading: districtsLoading } = 
  useDistricts(
    { iso_code: isoCode, state_id: selectedState, county_id: selectedCounty },
    { enabled: !!selectedCounty }
  );

const { data: neighborhoods, isLoading: neighborhoodsLoading } = 
  useNeighborhoods(
    { 
      iso_code: isoCode, 
      state_id: selectedState, 
      county_id: selectedCounty,
      district_id: selectedDistrict 
    },
    { enabled: !!selectedDistrict }
  );
```

**State Management for Cascading Selectors**:
```typescript
// Clear child selections when parent changes
useEffect(() => {
  if (selectedCountry) {
    form.setValue("residence.stateId", undefined);
    form.setValue("residence.countyId", undefined);
    form.setValue("residence.districtId", undefined);
    form.setValue("residence.neighborhoodId", undefined);
  }
}, [selectedCountry]);

useEffect(() => {
  if (selectedState) {
    form.setValue("residence.countyId", undefined);
    form.setValue("residence.districtId", undefined);
    form.setValue("residence.neighborhoodId", undefined);
  }
}, [selectedState]);

// Similar effects for county and district
```

### ProductForm CodesSection Integration

**Modified Component**: `dashboard/src/components/products/sections/CodesSection.tsx`

**Hook Usage**:
```typescript
const { data: codeTypes, isLoading: codeTypesLoading, isError: codeTypesError } = 
  useAllCodes({ iso_code: isoCode });
```

**Data Transformation**:
```typescript
// Transform API response to match existing CODE_TYPES structure
const CODE_TYPES = codeTypes?.map(ct => ({
  codeTypeId: ct.code,
  code: ct.code,
  description: ct.description
})) || [];
```

**Error Handling**:
```typescript
if (codeTypesError) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Códigos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-destructive">
          Error loading code types. Please try again.
        </div>
        <Button onClick={() => refetch()} size="sm">Retry</Button>
      </CardContent>
    </Card>
  );
}
```

### ProductForm DiscountsSection Integration

**Modified Component**: `dashboard/src/components/products/sections/DiscountsSection.tsx`

**Hook Usage**:
```typescript
const { data: discountTypes, isLoading: discountTypesLoading, isError: discountTypesError } = 
  useAllDiscountTypes({ iso_code: isoCode });
```

**Data Transformation**:
```typescript
// Transform API response to match existing DISCOUNT_TYPES structure
const DISCOUNT_TYPES = discountTypes?.map(dt => ({
  id: dt.id,
  code: dt.code,
  description: dt.description
})) || [];
```

**Special Handling for Code "99"**:
```typescript
const isOtherDiscountType = (discountTypeId: number) => {
  const discountType = DISCOUNT_TYPES.find((dt: any) => dt.id === discountTypeId);
  return discountType?.code === '99'; // Otro/Other - requires reason field
};
```

### ProductForm AdvancedTaxesSection Integration

**Modified Component**: `dashboard/src/components/products/sections/AdvancedTaxesSection.tsx`

**Hook Usage**:
```typescript
// Replace organization-specific API calls with data API hooks
const { data: taxTypes, isLoading: taxTypesLoading, isError: taxTypesError } = 
  useAllTaxes({ iso_code: isoCode });

const { data: taxRates, isLoading: taxRatesLoading, isError: taxRatesError } = 
  useAllTaxRates({ iso_code: isoCode });
```

**Fallback Strategy**:
```typescript
// If data API fails, fall back to organization-specific API
const { data: orgTaxTypes } = useQuery({
  queryKey: ["taxTypes", user?.id, defaultOrg?.id],
  queryFn: async () => {
    const res = await apiRequest("GET", buildOrgApiUrl(user.id, defaultOrg.id, "/catalogs/tax-types"));
    return res.json();
  },
  enabled: taxTypesError && !!user?.id && !!defaultOrg?.id,
});

const finalTaxTypes = taxTypes || orgTaxTypes || [];
```

**Preserve Special Tax Type Handling**:
The existing logic for IVA (01), IVACE (07), IVARBU (08), IUC (03), ISEBA (04), IPT (06), and ISEBEC (05) must remain unchanged. The integration only replaces the data source, not the calculation logic.

## Data Models

### API Response Types

All types are already defined in `dashboard/src/services/data-api/dtos.ts`. Key types used:

```typescript
// Document Types
interface DocumentTypeListResponse {
  id: number;
  code: string;
  description: string;
  iso_code: string;
}[]

// Countries
interface CountryListResponse {
  iso_code: string;
  name: string;
  phone_code: string;
}[]

// Location Hierarchy
interface StateListResponse {
  id: number;
  name: string;
  iso_code: string;
}[]

interface CountyListResponse {
  id: number;
  name: string;
  state_id: number;
}[]

interface DistrictListResponse {
  id: number;
  name: string;
  county_id: number;
}[]

interface NeighborhoodListResponse {
  id: number;
  name: string;
  district_id: number;
}[]

// Codes
interface CodeListResponse {
  id: number;
  code: string;
  description: string;
  iso_code: string;
}[]

// Discount Types
interface DiscountTypeListResponse {
  id: number;
  code: string;
  description: string;
  iso_code: string;
}[]

// Taxes
interface TaxListResponse {
  id: number;
  code: string;
  description: string;
  iso_code: string;
}[]

interface TaxRateListResponse {
  id: number;
  rate: number;
  tax_type_id: number;
  iso_code: string;
}[]
```

### Form Data Models

Existing models in `dashboard/src/models` remain unchanged. The integration only affects how dropdown options are populated, not the structure of submitted data.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

- Properties 1.5, 1.6, 1.7 (cascading data fetching) can be combined into a single property about location hierarchy data fetching
- Properties 5.1, 5.2, 5.3, 5.4 (clearing child fields) can be combined into a single property about cascading field clearing
- Properties 6.1 and 6.2 (loading indicators and disabling fields) can be combined into a single property about loading state handling
- Properties 6.3, 6.4, 6.5 (error display, retry, clear error) can be combined into a single property about error state handling
- Property 10.4 is redundant with the combined cascading data fetching property

The following properties provide unique validation value and will be included:

### Property 1: Country Selection Populates Phone Code

*For any* country selected in CustomerForm, the phone country code field should be automatically populated with the phone_code value from the selected country's data.

**Validates: Requirements 1.3**

### Property 2: Cascading Location Data Fetching

*For any* location hierarchy level (state, county, district, neighborhood), when a parent location is selected, the form should fetch the child location data using the appropriate hook with the correct parent ID parameters.

**Validates: Requirements 1.5, 1.6, 1.7, 10.4**

### Property 3: Cascading Field Clearing

*For any* location hierarchy level, when a parent location is selected or changed, all child location fields should be cleared and disabled until new data is loaded.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 4: Child Selectors Disabled Without Parent

*For any* location selector in the hierarchy, the selector should be disabled when its parent location is not selected.

**Validates: Requirements 5.5**

### Property 5: Selector Enabling After Data Load

*For any* location selector, the selector should only be enabled after both its parent location is selected AND the data for that level has finished loading.

**Validates: Requirements 5.7**

### Property 6: Loading State Handling

*For any* reference data being fetched, the affected form fields should display loading indicators and be disabled while the data is loading.

**Validates: Requirements 5.6, 6.1, 6.2**

### Property 7: Error State Handling

*For any* failed data API request, the form should display an error message near the affected field, provide a retry mechanism, and clear the error message when retry is initiated.

**Validates: Requirements 6.3, 6.4, 6.5**

### Property 8: Unaffected Fields Remain Interactive

*For any* reference data loading or error state, form fields that do not depend on that reference data should remain enabled and interactive.

**Validates: Requirements 6.6**

### Property 9: Code Type Display Fields

*For any* code type returned from the data API, the CodesSection should display options using the code type's code and description fields.

**Validates: Requirements 2.3**

### Property 10: Discount Type Display Fields

*For any* discount type returned from the data API, the DiscountsSection should display options using the discount type's code and description fields.

**Validates: Requirements 3.3**

### Property 11: Form Submission Validation

*For any* form submission attempt, the form should validate that all required reference data fields are populated and use the ID values from the selected reference data items.

**Validates: Requirements 8.1, 8.2**

### Property 12: Submission Blocked During Loading

*For any* form with reference data currently loading, the form submission should be prevented until all required reference data has finished loading.

**Validates: Requirements 8.4**

### Property 13: Submission Blocked On Error

*For any* form with failed reference data requests, the form submission should be prevented for fields that depend on the failed data.

**Validates: Requirements 8.5**

### Property 14: Validation Error Display

*For any* required reference data field that is not populated, the form should display a validation error message when submission is attempted.

**Validates: Requirements 8.6**

### Property 15: ISO Code Determination

*For any* organization context, the form should determine the ISO code from the organization's defaultCountry field, or use "CR" as the default if not available.

**Validates: Requirements 9.1, 9.2**

### Property 16: ISO Code Propagation

*For any* data API hook call that requires an ISO code, the form should pass the determined ISO code as a parameter.

**Validates: Requirements 9.3**

### Property 17: Data Refetch On Organization Change

*For any* organization context change, the form should refetch all reference data using the new organization's ISO code.

**Validates: Requirements 9.4**

### Property 18: Conditional Data Fetching

*For any* form field that depends on another field's value (like cascading selectors), the reference data should only be fetched when the dependency is satisfied.

**Validates: Requirements 10.1**

### Property 19: Non-Blocking Form Rendering

*For any* reference data loading state, the form should render and display its structure without blocking on data fetch completion.

**Validates: Requirements 10.5**

## Error Handling

### Error Categories

1. **Network Errors**: Connection failures, timeouts, server unavailability
2. **API Errors**: 4xx/5xx responses from the data API
3. **Data Errors**: Malformed or unexpected response data
4. **Context Errors**: Missing organization or user context

### Error Handling Strategy

#### Network and API Errors

```typescript
// Display error near affected field
if (isError) {
  return (
    <div className="space-y-2">
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Error loading options" />
        </SelectTrigger>
      </Select>
      <div className="text-sm text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Failed to load data. 
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => refetch()}
          className="h-auto p-0"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}
```

#### Fallback Strategy for AdvancedTaxesSection

The AdvancedTaxesSection implements a fallback to organization-specific APIs if the data API fails:

```typescript
const { data: dataApiTaxTypes, isError: dataApiError } = useAllTaxes({ iso_code: isoCode });

const { data: orgTaxTypes } = useQuery({
  queryKey: ["taxTypes", user?.id, defaultOrg?.id],
  queryFn: async () => {
    const res = await apiRequest("GET", buildOrgApiUrl(user.id, defaultOrg.id, "/catalogs/tax-types"));
    return res.json();
  },
  enabled: dataApiError && !!user?.id && !!defaultOrg?.id,
});

const taxTypes = dataApiTaxTypes || orgTaxTypes || [];
```

#### Context Errors

```typescript
// Determine ISO code with fallback
const isoCode = useMemo(() => {
  return organization?.organizationCountry || "CR";
}, [organization]);

// Disable form if critical context is missing
const canSubmit = useMemo(() => {
  return !!user?.id && !!defaultOrg?.id && !isLoadingCriticalData;
}, [user, defaultOrg, isLoadingCriticalData]);
```

### Error Recovery

1. **Automatic Retry**: React Query automatically retries failed requests (default: 3 attempts)
2. **Manual Retry**: Users can click "Retry" button to manually trigger refetch
3. **Fallback Data**: AdvancedTaxesSection falls back to organization-specific APIs
4. **Graceful Degradation**: Forms remain partially functional even if some reference data fails

### Error Logging

All errors should be logged for debugging:

```typescript
if (isError) {
  console.error('Failed to load reference data:', {
    hook: 'useAllDocumentTypes',
    isoCode,
    error
  });
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Unit Testing

Unit tests should focus on:

1. **Specific Examples**:
   - CustomerForm renders with document types from API
   - CodesSection displays error message when API fails
   - DiscountsSection preserves special handling for code "99"
   - AdvancedTaxesSection falls back to org API when data API fails
   - ISO code defaults to "CR" when organization context is unavailable

2. **Integration Points**:
   - Form submission uses ID values from selected reference data
   - Organization context changes trigger data refetch
   - Critical data failure disables form submission

3. **Edge Cases**:
   - Organization ISO code is null or undefined
   - Empty response arrays from API
   - Concurrent location selector changes

### Property-Based Testing

Property tests should be implemented using a property-based testing library appropriate for the TypeScript/React ecosystem (e.g., fast-check).

**Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `Feature: data-service-form-integration, Property {number}: {property_text}`

**Property Test Examples**:

```typescript
// Property 1: Country Selection Populates Phone Code
test('Feature: data-service-form-integration, Property 1: Country selection populates phone code', () => {
  fc.assert(
    fc.property(
      fc.record({
        iso_code: fc.string(),
        name: fc.string(),
        phone_code: fc.string()
      }),
      (country) => {
        const { getByLabelText } = render(<CustomerForm {...props} />);
        
        // Select country
        fireEvent.change(getByLabelText('Nationality'), { 
          target: { value: country.iso_code } 
        });
        
        // Phone code should be populated
        const phoneCodeField = getByLabelText('Phone Code');
        expect(phoneCodeField.value).toBe(country.phone_code);
      }
    ),
    { numRuns: 100 }
  );
});

// Property 3: Cascading Field Clearing
test('Feature: data-service-form-integration, Property 3: Cascading field clearing', () => {
  fc.assert(
    fc.property(
      fc.record({
        stateId: fc.integer(),
        countyId: fc.integer(),
        districtId: fc.integer(),
        neighborhoodId: fc.integer()
      }),
      (initialLocation) => {
        const { getByLabelText } = render(
          <CustomerForm 
            {...props} 
            initialData={{ residence: initialLocation }} 
          />
        );
        
        // Change state
        fireEvent.change(getByLabelText('State'), { 
          target: { value: initialLocation.stateId + 1 } 
        });
        
        // Child fields should be cleared
        expect(getByLabelText('County').value).toBe('');
        expect(getByLabelText('District').value).toBe('');
        expect(getByLabelText('Neighborhood').value).toBe('');
      }
    ),
    { numRuns: 100 }
  );
});

// Property 6: Loading State Handling
test('Feature: data-service-form-integration, Property 6: Loading state handling', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('documentTypes', 'countries', 'states', 'counties'),
      (dataType) => {
        // Mock loading state for the data type
        mockUseQuery.mockReturnValue({ 
          data: undefined, 
          isLoading: true, 
          isError: false 
        });
        
        const { container } = render(<CustomerForm {...props} />);
        
        // Should show loading indicator
        expect(container.querySelector('.loading-indicator')).toBeInTheDocument();
        
        // Affected field should be disabled
        const affectedField = getAffectedField(dataType);
        expect(affectedField).toBeDisabled();
      }
    ),
    { numRuns: 100 }
  );
});
```

### Testing Tools

- **Unit Testing**: Jest + React Testing Library
- **Property Testing**: fast-check
- **Mocking**: Mock Service Worker (MSW) for API mocking
- **Coverage**: Aim for >80% code coverage

### Test Organization

```
dashboard/src/components/
├── customers/
│   ├── CustomerForm.tsx
│   ├── CustomerForm.test.tsx          # Unit tests
│   └── CustomerForm.property.test.tsx # Property tests
├── products/
│   └── sections/
│       ├── CodesSection.tsx
│       ├── CodesSection.test.tsx
│       ├── DiscountsSection.tsx
│       ├── DiscountsSection.test.tsx
│       ├── AdvancedTaxesSection.tsx
│       └── AdvancedTaxesSection.test.tsx
```

### Continuous Integration

All tests (unit and property) should run on every pull request and must pass before merging.
