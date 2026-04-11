# Document Version ID Injection - Complete Fix

## Summary
Fixed all Hacienda-related endpoints to automatically inject `document_version_id` parameter, and added missing translation keys for error handling.

## Changes Made

### 1. Data API Client (`dashboard/src/services/data-api/client.ts`)

Updated all Hacienda endpoints to use `injectDocumentVersion()` method:

#### Endpoints Fixed:
- ✅ `getAllCodes()` - Product codes
- ✅ `getCode()` - Single product code
- ✅ `getAllExemptions()` - Tax exemptions
- ✅ `getExemption()` - Single exemption
- ✅ `getAllExemptionIssuingInstitutions()` - Exemption institutions
- ✅ `getExemptionIssuingInstitution()` - Single institution
- ✅ `getAllFactoryTaxCharges()` - Factory tax charges
- ✅ `getFactoryTaxCharge()` - Single factory tax charge
- ✅ `getAllMeasurementUnits()` - Measurement units
- ✅ `getMeasurementUnit()` - Single measurement unit
- ✅ `getAllOtherCharges()` - Other charges
- ✅ `getOtherCharge()` - Single other charge
- ✅ `getAllPayments()` - Payment methods
- ✅ `getPayment()` - Single payment method
- ✅ `getAllReferenceCodes()` - Reference codes
- ✅ `getReferenceCode()` - Single reference code
- ✅ `getAllReferences()` - References
- ✅ `getReference()` - Single reference
- ✅ `getAllSaleConditions()` - Sale conditions
- ✅ `getSaleCondition()` - Single sale condition
- ✅ `getAllTaxConditions()` - Tax conditions
- ✅ `getTaxCondition()` - Single tax condition
- ✅ `getAllTransactions()` - Transactions
- ✅ `getTransaction()` - Single transaction
- ✅ `getAllTaxes()` - Tax types (already fixed)
- ✅ `getTax()` - Single tax type (already fixed)
- ✅ `getAllTaxRates()` - Tax rates (already fixed)
- ✅ `getTaxRate()` - Single tax rate (already fixed)

#### Endpoints That DON'T Need document_version_id:
- ❌ `getAllDiscountTypes()` - Not Hacienda-related
- ❌ `getAllDocumentTypes()` - Not Hacienda-related
- ❌ `getAllEconomicActivities()` - Not Hacienda-related
- ❌ `getAllIdentifications()` - Not Hacienda-related
- ❌ `getAllCustomerTypes()` - Not Hacienda-related
- ❌ `getAllProductTypes()` - Not Hacienda-related
- ❌ All location endpoints (states, counties, districts, neighborhoods)
- ❌ All currency endpoints
- ❌ CABYS search
- ❌ Taxpayer info
- ❌ Exchange rates

### 2. Language Context (`dashboard/src/contexts/LanguageContext.tsx`)

Added missing translation keys for error handling:

#### English (en):
```typescript
'common.errorLoadingData': 'Error loading data',
'common.retry': 'Retry',
```

#### Spanish (es):
```typescript
'common.errorLoadingData': 'Error al cargar datos',
'common.retry': 'Reintentar',
```

These keys are used in:
- `CodesSection.tsx`
- `DiscountsSection.tsx`
- `CustomerForm.tsx` sections
- Any component that shows error states with retry buttons

## How It Works

### Before (Manual):
```typescript
// Component had to pass document_version_id
const { data: codes } = useAllCodes({
  iso_code: "188",
  document_version_id: documentVersionId  // ❌ Manual
});
```

### After (Automatic):
```typescript
// Component just passes iso_code
const { data: codes } = useAllCodes({
  iso_code: "188"  // ✅ Automatic injection
});
```

The `injectDocumentVersion()` method in the client automatically adds `document_version_id` if:
1. The client has a document version ID set (via `DocumentVersionContext`)
2. The params don't already have a `document_version_id`

## Benefits

1. **Cleaner Components**: No need to pass `document_version_id` everywhere
2. **Consistent Behavior**: All Hacienda endpoints work the same way
3. **Automatic Updates**: When document version changes, all calls update automatically
4. **Error Handling**: Proper translation keys for error states
5. **Type Safety**: TypeScript interfaces remain clean

## Testing Checklist

- [ ] CodesSection loads product codes correctly
- [ ] DiscountsSection loads discount types correctly
- [ ] AdvancedTaxesSection loads taxes and tax rates correctly
- [ ] Error states show proper translated messages
- [ ] Retry buttons work correctly
- [ ] Document version changes trigger refetch
- [ ] All diagnostics pass with no errors

## Related Files
- `dashboard/src/services/data-api/client.ts` - Client with injection logic
- `dashboard/src/contexts/DocumentVersionContext.tsx` - Context provider
- `dashboard/src/contexts/LanguageContext.tsx` - Translation keys
- `dashboard/DOCUMENT_VERSION_MANAGEMENT.md` - Architecture documentation
- `dashboard/ISO_CODE_MIGRATION.md` - ISO code migration details

## API Endpoints Reference

### Hacienda Endpoints (require document_version_id):
All endpoints under `/countries/{iso_code}/` that deal with Hacienda regulations:
- codes, exemptions, exemptions-issuing-institutions
- factory-tax-charges, measurement-units, other-charges
- payments, reference-codes, references
- sale-conditions, tax-conditions, taxes, tax-rates, transactions

### Non-Hacienda Endpoints (don't require document_version_id):
- discounts, documents, economic-activities
- identifications, customer-types, product-types
- states, counties, districts, neighborhoods
- currencies, cabys, taxpayer, exchange-rate
