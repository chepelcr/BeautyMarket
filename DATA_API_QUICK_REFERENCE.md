# Data API - Quick Reference

## Setup

1. Add to `.env`:
```env
VITE_DATA_API_URL=https://data-api.tsuru.jcampos.dev
```

2. Import hooks:
```typescript
import { useAllDocumentVersions, useStates } from '@/hooks/useDataApi';
```

## Common Use Cases

### 1. Fetch Document Versions
```typescript
const { data, isLoading, error } = useAllDocumentVersions({
  isoCode: '188',
  status: '1'
});
```

### 2. Location Hierarchy
```typescript
// States
const { data: states } = useStates({ isoCode: '188' });

// Counties (requires state)
const { data: counties } = useCounties({ 
  isoCode: '188', 
  stateId: 1 
});

// Districts (requires state + county)
const { data: districts } = useDistricts({ 
  isoCode: '188', 
  stateId: 1, 
  countyId: 1 
});

// Neighborhoods (requires state + county + district)
const { data: neighborhoods } = useNeighborhoods({ 
  isoCode: '188', 
  stateId: 1, 
  countyId: 1, 
  districtId: 1 
});
```

### 3. Fetch Countries
```typescript
// All countries
const { data: countries } = useAllCountries();

// Search by ISO code
const { data: country } = useSearchCountry({ isoCode: '188' });
```

### 4. Fetch Taxes
```typescript
const { data: taxes } = useAllTaxes({
  isoCode: '188',
  documentVersionId: 1,
  status: '1'
});
```

### 5. Fetch Customer Types
```typescript
const { data: customerTypes } = useAllCustomerTypes({ status: '1' });
```

### 6. Fetch Discount Types
```typescript
const { data: discounts } = useAllDiscountTypes({
  isoCode: '188',
  status: '1'
});
```

### 7. Fetch Document Types
```typescript
const { data: docTypes } = useAllDocumentTypes({
  isoCode: '188',
  status: '1',
  biller: 'true'
});
```

### 8. Fetch Codes
```typescript
const { data: codes } = useAllCodes({
  isoCode: '188',
  documentVersionId: 1,
  status: '1'
});
```

## Direct Client Usage

```typescript
import { dataApiClient } from '@/services/data-api';

// In async function
const countries = await dataApiClient.getAllCountries();
const states = await dataApiClient.getStates({ isoCode: '188' });
const taxes = await dataApiClient.getAllTaxes({ 
  isoCode: '188', 
  documentVersionId: 1 
});
```

## Conditional Fetching

```typescript
// Only fetch when condition is met
const { data: counties } = useCounties(
  { isoCode: '188', stateId: selectedState! },
  { enabled: !!selectedState } // Only fetch if selectedState exists
);
```

## Error Handling

```typescript
const { data, isLoading, error, isError } = useAllCountries();

if (isLoading) return <div>Loading...</div>;
if (isError) return <div>Error: {error.message}</div>;
if (!data) return <div>No data</div>;

return <div>{/* Render data */}</div>;
```

## Available Hooks

### Document Versions
- `useDocumentVersion(params)` - Get by ID or version number
- `useAllDocumentVersions(params)` - List all
- `useDocumentVersionById(params)` - Get by path ID

### Codes
- `useCode(params)` - Get by ID or code
- `useAllCodes(params)` - List all

### Customer Types
- `useAllCustomerTypes(params?)` - List all
- `useCustomerTypeById(params)` - Get by ID

### Discount Types
- `useDiscountType(params)` - Get by ID or code
- `useAllDiscountTypes(params)` - List all

### Documents
- `useDocumentType(params)` - Get by ID or code
- `useAllDocumentTypes(params)` - List all

### Locations
- `useSearchCountry(params)` - Search country
- `useAllCountries(params?)` - List all countries
- `useStates(params)` - Get states
- `useCounties(params)` - Get counties
- `useDistricts(params)` - Get districts
- `useNeighborhoods(params)` - Get neighborhoods

### Currencies
- `useAllCurrencies()` - List all
- `useCurrencyByCode(code)` - Get by code

### Taxes
- `useTax(params)` - Get by ID or code
- `useAllTaxes(params)` - List all
- `useTaxRate(params)` - Get rate by ID or code
- `useAllTaxRates(params)` - List all rates

## Type Definitions

All responses are fully typed. Import types:

```typescript
import type {
  DocumentVersionResponse,
  CountryResponse,
  StateResponse,
  TaxResponse,
  CustomerTypeResponse
} from '@/services/data-api';
```

## React Query Options

All hooks accept React Query options:

```typescript
const { data } = useAllCountries(undefined, {
  staleTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 3
});
```

## Common Patterns

### Cascading Selects
```typescript
const [stateId, setStateId] = useState<number>();
const { data: states } = useStates({ isoCode: '188' });
const { data: counties } = useCounties(
  { isoCode: '188', stateId: stateId! },
  { enabled: !!stateId }
);
```

### Loading States
```typescript
const { data, isLoading } = useAllCountries();
return isLoading ? <Spinner /> : <CountryList data={data} />;
```

### Refetching
```typescript
const { data, refetch } = useAllCountries();
<button onClick={() => refetch()}>Refresh</button>
```

## Documentation

- Full Guide: `dashboard/src/services/data-api/README.md`
- Examples: `dashboard/src/services/data-api/examples.tsx`
- Implementation: `DATA_API_IMPLEMENTATION.md`
