# Document Version Management

## Overview
Document versions are required for Hacienda-related data API endpoints (taxes, tax rates, exemptions, etc.). The system automatically manages document versions internally, so components don't need to worry about passing `document_version_id` parameters.

## Architecture

### 1. DocumentVersionContext (`dashboard/src/contexts/DocumentVersionContext.tsx`)
- Fetches active document versions for the organization's country on app load
- Automatically updates the data API client with the current document version ID
- Provides a hook for components that need to check document version status

### 2. Data API Client (`dashboard/src/services/data-api/client.ts`)
- Stores the current document version ID internally
- Automatically injects `document_version_id` into Hacienda endpoint calls
- Methods: `setDocumentVersionId()`, `getDocumentVersionId()`, `injectDocumentVersion()`

### 3. App.tsx Integration
- Wraps the app with `DocumentVersionProvider`
- Passes the organization's ISO code to the provider
- Document version is fetched before organization data is available

## How It Works

1. **App loads** → `DocumentVersionProvider` is initialized with ISO code "188" (Costa Rica)
2. **Provider fetches** → Calls `useAllDocumentVersions({ iso_code: "188", status: "1" })`
3. **Version selected** → Sorts by `version_date` descending, selects most recent
4. **Client updated** → Calls `dataApiClient.setDocumentVersionId(id)`
5. **Components call** → `useAllTaxes({ iso_code: "188" })` (no document_version_id needed!)
6. **Client injects** → Automatically adds `document_version_id` to the request

## Usage in Components

### Before (Manual Management)
```typescript
const { documentVersionId } = useDocumentVersion();

const { data: taxes } = useAllTaxes(
  { iso_code: isoCode, document_version_id: documentVersionId! },
  { enabled: !!documentVersionId }
);
```

### After (Automatic Management)
```typescript
const { data: taxes } = useAllTaxes({
  iso_code: isoCode
});
```

The `document_version_id` is automatically injected by the data API client!

## Affected Endpoints

The following endpoints automatically receive `document_version_id`:

### Hacienda Endpoints (require document_version_id)
- `/countries/{iso_code}/taxes` - Tax types
- `/countries/{iso_code}/tax-rates` - Tax rates
- `/countries/{iso_code}/exemptions` - Exemptions
- `/countries/{iso_code}/exemptions-issuing-institutions` - Exemption institutions
- `/countries/{iso_code}/factory-tax-charges` - Factory tax charges
- `/countries/{iso_code}/measurement-units` - Measurement units
- `/countries/{iso_code}/other-charges` - Other charges
- `/countries/{iso_code}/payments` - Payment methods
- `/countries/{iso_code}/reference-codes` - Reference codes
- `/countries/{iso_code}/references` - References
- `/countries/{iso_code}/sale-conditions` - Sale conditions
- `/countries/{iso_code}/tax-conditions` - Tax conditions
- `/countries/{iso_code}/transactions` - Transactions

### Non-Hacienda Endpoints (don't need document_version_id)
- `/countries/{iso_code}/codes` - Product codes
- `/countries/{iso_code}/discounts` - Discount types
- `/countries/{iso_code}/documents` - Document types
- `/customer-types` - Customer types
- `/product-types` - Product types
- All location endpoints (states, counties, districts, neighborhoods)
- All currency endpoints

## Organization Context Changes

When the organization changes (and thus the ISO code changes):
1. `DocumentVersionProvider` receives new `isoCode` prop
2. `useAllDocumentVersions` refetches with new ISO code
3. New document version ID is calculated
4. `dataApiClient.setDocumentVersionId()` is called with new ID
5. All subsequent data API calls use the new document version ID

## Benefits

1. **Simpler Components**: No need to pass `document_version_id` everywhere
2. **Centralized Management**: Document version logic in one place
3. **Automatic Updates**: Changes propagate automatically when organization changes
4. **Type Safety**: TypeScript interfaces remain clean
5. **Fallback Support**: Components can still override if needed

## Debugging

To check the current document version ID:
```typescript
import { dataApiClient } from '@/services/data-api';

console.log('Current document version:', dataApiClient.getDocumentVersionId());
```

To check document version status in a component:
```typescript
import { useDocumentVersion } from '@/contexts/DocumentVersionContext';

const { documentVersionId, isLoading, isError } = useDocumentVersion();
```

## Related Files
- `dashboard/src/contexts/DocumentVersionContext.tsx` - Context provider
- `dashboard/src/services/data-api/client.ts` - Data API client with injection
- `dashboard/src/App.tsx` - Provider integration
- `dashboard/src/hooks/useDataApi.ts` - React Query hooks
- `dashboard/ISO_CODE_MIGRATION.md` - ISO code migration details
