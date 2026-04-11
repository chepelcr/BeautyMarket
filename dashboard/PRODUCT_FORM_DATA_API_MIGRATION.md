# Product Form Components - Data API Migration

## Summary
Migrated all product form components from hardcoded data to Data API integration, ensuring consistent data sources and automatic updates.

## Components Fixed

### 1. ✅ FiscalInformationSection.tsx
**Issue**: Hardcoded `PRODUCT_TYPES` array
```typescript
// Before
const PRODUCT_TYPES = [
  { id: 1, description: "Bien" },
  { id: 2, description: "Servicio" },
];
```

**Fix**: Now uses `useAllProductTypes()` from Data API
```typescript
const { data: productTypes, isLoading: productTypesLoading } = useAllProductTypes();
```

**Benefits**:
- Product types can be managed centrally
- Supports multiple languages
- Automatic updates when product types change

---

### 2. ✅ GeneralInfoSection.tsx
**Issue**: Hardcoded `MEASUREMENT_UNITS` array with only 7 units
```typescript
// Before
const MEASUREMENT_UNITS = [
  { unitId: 1, code: "Sp", description: "Servicios Profesionales" },
  { unitId: 2, code: "m", description: "Metro" },
  // ... only 7 units
];
```

**Fix**: Now uses `useAllMeasurementUnits()` from Data API
```typescript
const { data: measurementUnits, isLoading: measurementUnitsLoading } = useAllMeasurementUnits({
  iso_code: isoCode
});
```

**Benefits**:
- Access to all measurement units from Hacienda
- Country-specific units based on organization
- Automatic document version injection
- Loading states for better UX

---

### 3. ✅ CommercialValueSection.tsx
**Issue**: Hardcoded `TAX_TYPES` array with only 4 tax types
```typescript
// Before
const TAX_TYPES = [
  { taxId: 1, code: '01', description: 'IVA' },
  { taxId: 2, code: '02', description: 'Impuesto Selectivo de Consumo' },
  { taxId: 7, code: '07', description: 'IVA (Cálculo Especial)' },
  { taxId: 3, code: '99', description: 'Otros' }
];
```

**Fix**: Now uses `useAllTaxes()` from Data API with fallback
```typescript
const { data: dataApiTaxTypes, isError: taxTypesError } = useAllTaxes({
  iso_code: isoCode
});

// Fallback to organization-specific API if data API fails
const { data: orgTaxTypes } = useQuery<any[]>({
  queryKey: ["taxTypes", user?.id, defaultOrg?.id],
  queryFn: async () => { /* ... */ },
  enabled: taxTypesError && !!user?.id && !!defaultOrg?.id,
});

const TAX_TYPES = dataApiTaxTypes || orgTaxTypes || [];
```

**Benefits**:
- Access to all tax types from Hacienda
- Automatic document version injection
- Fallback to organization API for reliability
- Used for tax calculations in TaxCalculationService

---

## Already Using Data API ✅

### 4. ✅ CodesSection.tsx
- Uses `useAllCodes()` from Data API
- Automatic document version injection
- ISO code from organization context

### 5. ✅ DiscountsSection.tsx
- Uses `useAllDiscountTypes()` from Data API
- Automatic document version injection
- ISO code from organization context

### 6. ✅ AdvancedTaxesSection.tsx
- Uses `useAllTaxes()` and `useAllTaxRates()` from Data API
- Automatic document version injection
- Fallback to organization API
- ISO code from organization context

---

## Components Without External Data

### 7. ✅ PackagingSection.tsx
- No external data needed
- Pure calculation component

### 8. ✅ CustomsSection.tsx
- No external data needed
- Simple input field

### 9. ✅ InventorySection.tsx
- No external data needed
- Form fields only

---

## Data Flow Architecture

```
App.tsx
  └─> DocumentVersionProvider (fetches active document version)
       └─> dataApiClient.setDocumentVersionId()
            └─> Product Form Components
                 ├─> FiscalInformationSection
                 │    └─> useAllProductTypes()
                 ├─> GeneralInfoSection
                 │    └─> useAllMeasurementUnits({ iso_code })
                 │         └─> Auto-injects document_version_id
                 ├─> CodesSection
                 │    └─> useAllCodes({ iso_code })
                 │         └─> Auto-injects document_version_id
                 ├─> DiscountsSection
                 │    └─> useAllDiscountTypes({ iso_code })
                 ├─> AdvancedTaxesSection
                 │    ├─> useAllTaxes({ iso_code })
                 │    │    └─> Auto-injects document_version_id
                 │    └─> useAllTaxRates({ iso_code })
                 │         └─> Auto-injects document_version_id
                 └─> CommercialValueSection
                      └─> useAllTaxes({ iso_code })
                           └─> Auto-injects document_version_id
```

## ISO Code Management

All components that need ISO code follow this pattern:
```typescript
const { user } = useAuth();
const { useDefaultOrganization } = useOrganization();
const { data: defaultOrg } = useDefaultOrganization(user?.id);

const isoCode = useMemo(() => {
  // @ts-ignore - organization_country field will be added to Organization model
  return defaultOrg?.organization_country || "188";
}, [defaultOrg]);
```

## Document Version Management

- Document version ID is managed internally by `DocumentVersionContext`
- Automatically injected into all Hacienda endpoints by `dataApiClient`
- Components don't need to pass `document_version_id` parameter
- See `DOCUMENT_VERSION_MANAGEMENT.md` for details

## Benefits of Migration

1. **Centralized Data**: All reference data comes from Data API
2. **Automatic Updates**: Changes in Hacienda catalogs reflect immediately
3. **Country-Specific**: Data adapts to organization's country
4. **Version Control**: Automatic document version management
5. **Consistency**: Same data source across all components
6. **Maintainability**: No hardcoded arrays to update
7. **Scalability**: Easy to add new countries/regulations
8. **Error Handling**: Proper loading and error states
9. **Fallback Support**: Organization API fallback for critical data

## Testing Checklist

- [ ] Product types load correctly in FiscalInformationSection
- [ ] Measurement units load correctly in GeneralInfoSection
- [ ] Tax types load correctly in CommercialValueSection
- [ ] Tax calculations work with dynamic tax types
- [ ] All sections show loading states properly
- [ ] Error states display with retry buttons
- [ ] ISO code changes trigger refetch
- [ ] Document version changes trigger refetch
- [ ] Fallback to organization API works when needed

## Related Documentation

- `DOCUMENT_VERSION_MANAGEMENT.md` - Document version architecture
- `DOCUMENT_VERSION_FIXES.md` - Document version injection fixes
- `ISO_CODE_MIGRATION.md` - ISO code migration details
- `ORGANIZATION_CONTEXT_CHANGE_HANDLING.md` - Organization context changes

## API Endpoints Used

### Data API (Primary):
- `/product-types/all` - Product types (no document_version_id needed)
- `/countries/{iso_code}/measurement-units/all` - Measurement units (auto-injects document_version_id)
- `/countries/{iso_code}/codes/all` - Product codes (auto-injects document_version_id)
- `/countries/{iso_code}/discounts/all` - Discount types (no document_version_id needed)
- `/countries/{iso_code}/taxes/all` - Tax types (auto-injects document_version_id)
- `/countries/{iso_code}/tax-rates/all` - Tax rates (auto-injects document_version_id)

### Organization API (Fallback):
- `/organizations/{org_id}/catalogs/tax-types` - Tax types fallback
- `/organizations/{org_id}/catalogs/tax-rates` - Tax rates fallback
