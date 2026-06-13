# Data API Endpoint Fixes

## Summary
Fixed data API client endpoints to match the actual backend API definitions in data-services.

## Issues Found

### 1. Measurement Units ❌ → ✅
**Problem**: Client was calling `/countries/{iso_code}/measurement-units/all`  
**Actual API**: `/measurement-units/all` (NO country prefix)  
**Fix**: Removed `iso_code` from path, kept it in params for consistency

```typescript
// Before (WRONG)
async getAllMeasurementUnits(params: GetAllMeasurementUnitsParams) {
  const { iso_code, ...queryParams } = params;
  return this.request(`/countries/${iso_code}/measurement-units/all`, queryParams);
}

// After (CORRECT)
async getAllMeasurementUnits(params: GetAllMeasurementUnitsParams) {
  const { iso_code, ...queryParams } = params;
  return this.request(`/measurement-units/all`, this.injectDocumentVersion(queryParams));
}
```

### 2. Product Types ✅
**Status**: Already correct!  
**API**: `/product-types/all` (NO country prefix)  
**Client**: `/product-types/all` ✅

```typescript
async getAllProductTypes(params?: GetAllProductTypesParams) {
  return this.request('/product-types/all', params);
}
```

### 3. Tax Factors ✅
**Status**: Already correct!  
**API**: `/countries/{iso_code}/tax-factors/all` (WITH country prefix)  
**Client**: `/countries/{iso_code}/tax-factors/all` ✅

```typescript
async getAllTaxFactors(params: GetAllTaxFactorsParams) {
  const { iso_code, ...queryParams } = params;
  return this.request(`/countries/${iso_code}/tax-factors/all`, queryParams);
}
```

## Backend API Patterns

### Pattern 1: Country-Scoped Hacienda Endpoints
These endpoints require `iso_code` in the path AND `document_version_id` in query params:

```
/countries/{iso_code}/taxes/all
/countries/{iso_code}/tax-rates/all
/countries/{iso_code}/tax-factors/all
/countries/{iso_code}/codes/all
/countries/{iso_code}/exemptions/all
/countries/{iso_code}/payments/all
/countries/{iso_code}/references/all
/countries/{iso_code}/sale-conditions/all
/countries/{iso_code}/tax-conditions/all
/countries/{iso_code}/transactions/all
... (and more)
```

### Pattern 2: Global Endpoints (No Country Scope)
These endpoints don't require `iso_code` in the path:

```
/measurement-units/all
/product-types/all
/customer-types/all
/notification-codes/all
/tax-rate-codes/all
/currencies
```

### Pattern 3: Location Endpoints
These use `iso_code` but don't need `document_version_id`:

```
/countries/all
/countries/{iso_code}/states
/countries/{iso_code}/states/{state_id}/counties
/countries/{iso_code}/states/{state_id}/counties/{county_id}/districts
```

## Why Measurement Units Don't Use Country Prefix

Looking at the backend controller (`data-services/app/measurement-units/src/controllers/measurement_units_controller.py`):

```python
@app.get(
    "/measurement-units/all",  # NO /countries/{iso_code} prefix
    tags=["Unidades de Medida"],
    summary="Listar unidades de medida",
    ...
)
async def get_all(
    status: Optional[int] = None,
    unit_type_id: Optional[int] = None,
    document_version_id: Optional[int] = None  # Still accepts document_version_id
):
```

Measurement units are **global** but still accept `document_version_id` for filtering by Hacienda version.

## Testing Checklist

- [x] Measurement units load correctly
- [x] Product types load correctly  
- [x] Tax factors load correctly
- [ ] Verify measurement units filter by document_version_id
- [ ] Verify all Hacienda endpoints inject document_version_id
- [ ] Test with different ISO codes (188, 840, etc.)

## Related Files
- `BeautyMarket/dashboard/src/services/data-api/client.ts` - Fixed client
- `data-services/app/measurement-units/src/controllers/measurement_units_controller.py` - Backend API
- `data-services/app/product-types/src/controllers/product_types_controller.py` - Backend API
- `data-services/app/tax-factors/src/controllers/tax_factors_controller.py` - Backend API
- `BeautyMarket/dashboard/DOCUMENT_VERSION_MANAGEMENT.md` - Document version architecture
- `BeautyMarket/dashboard/DOCUMENT_VERSION_FIXES.md` - Document version injection fixes

## API Gateway Configuration

Make sure the API Gateway routes are configured correctly:
- `/measurement-units/*` → measurement-units service
- `/product-types/*` → product-types service  
- `/countries/{iso_code}/tax-factors/*` → tax-factors service

Check `data-services/api-gateway/endpoints.json` for routing configuration.
