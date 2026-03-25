# Tax Implementation Guide for BeautyMarket

Based on JCampos-Biller proven implementation approach.

## Tax Type Configuration

Each tax type has specific behavior defined by configuration:

```typescript
interface TaxTypeConfig {
  code: string;
  description: string;
  iva: boolean;              // Is IVA-type tax?
  requiresSpecialFields: boolean;
  requireRate: boolean;
  rate: number | null;       // Fixed rate if applicable
  forBaseAmount: boolean;    // Add to base for IVA calc?
  forFactoryTax: boolean;    // Subject to factory rules?
}
```

## Tax Types Summary

| Code | Type | IVA | Special Fields | Rate | Base Amount | Factory Tax |
|------|------|-----|----------------|------|-------------|-------------|
| 01 | IVA | ✓ | ✗ | Variable | ✗ | ✗ |
| 02 | ISC | ✗ | ✗ | Variable | ✓ | ✗ |
| 03 | IUC | ✗ | ✓ | ✗ | ✗ | ✓ |
| 04 | ISEBA | ✗ | ✓ | ✗ | ✓ | ✓ |
| 05 | ISEBEC | ✗ | ✓ | ✗ | ✓ | ✓ |
| 06 | IPT | ✗ | ✓ | ✗ | ✗ | ✓ |
| 07 | IVACE | ✓ | ✗ | Variable | ✗ | ✗ |
| 08 | IVARBU | ✓ | ✗ | Factor | ✗ | ✗ |
| 12 | ISEC | ✗ | ✗ | 5.0% | ✓ | ✓ |
| 99 | Others | ✗ | ✗ | Variable | ✗ | ✗ |

## Calculation Formulas

### IVA Taxes (01, 07)
```
amount = baseAmount × (rate / 100)
```

### IVARBU (08)
```
amount = factor × subtotal
```

### IUC (03)
```
amount = taxAmount × quantity
```

### ISEBA (04)
```
proportion = (quantity × percentage) / 100
amount = detailQuantity × proportion × taxAmount
```

### ISEBEC (05)
Non-alcoholic beverages (CABYS 2202):
```
altAmount = taxAmount / volumeConsumption
amount = detailQuantity × quantity × altAmount
```

Other products:
```
amount = quantity × volumeConsumption × taxAmount
```

### IPT (06)
```
amount = detailQuantity × quantity × taxAmount
```

### ISC, ISEC, Others (02, 12, 99)
```
amount = baseAmount × (rate / 100)
```

## UI Components Structure

### 1. FiscalInformationSection
- Product type selection
- CABYS search and selection
- Auto-creates default IVA tax with suggested rate

### 2. AdvancedTaxesSection
Contains two subsections:

#### A. IvaTaxSection
- Handles types 01, 07, 08
- Rate/Factor selection
- Exemption configuration
- Rate warning vs suggested

#### B. OtherTaxSection
- Handles types 02, 03, 04, 05, 06, 12, 99
- Dynamic special fields
- Tax amount catalog loading
- CABYS validation

## Implementation Files Needed

1. `constants/taxTypes.ts` - Tax configurations
2. `services/taxCalculationService.ts` - Calculation logic
3. `components/products/sections/FiscalInformationSection.tsx`
4. `components/products/sections/AdvancedTaxesSection.tsx`
5. `components/invoices/line-detail/IvaTaxSection.tsx`
6. `components/invoices/line-detail/OtherTaxSection.tsx`

## Key Features

- CABYS-based tax suggestion
- Dynamic special fields per tax type
- Tax amount catalog integration
- Factory tax logic
- Exemption support (IVA only)
- Rate validation warnings
- Calculation preview

## Next Steps

1. Create tax type constants
2. Implement calculation service
3. Build UI components
4. Add API integrations
5. Add translations
6. Test calculations
