# Tax Types Implementation Guide

## Overview

This document describes the implementation of the tax types system in the product form, based on the official Costa Rica Ministerio de Hacienda tax catalog.

## Files Created/Modified

### New Files
- `dashboard/src/constants/taxTypes.ts` - Tax types enum and requirements configuration

### Modified Files
- `dashboard/src/components/products/sections/AdvancedTaxesSection.tsx` - Updated to use new tax types and validations

## Tax Types Catalog

All tax types use official Hacienda codes:

| Code | Name | Description | Requirements |
|------|------|-------------|--------------|
| 01 | Impuesto al Valor Agregado | IVA | Tax rate (0%, 1%, 2%, 4%, 13%) |
| 02 | Impuesto Selectivo de Consumo | ISC | Percentage |
| 03 | Impuesto Único a los Combustibles | Combustibles | Tax amount from catalog |
| 04 | Impuesto específico de Bebidas Alcohólicas | Bebidas Alcohólicas | Volume (ml), alcohol %, tax amount |
| 05 | Impuesto Específico sobre bebidas envasadas | Bebidas y Jabones | Quantity, tax amount |
| 06 | Impuesto a los Productos de Tabaco | Tabaco | Quantity, tax amount |
| 07 | IVA (cálculo especial) | IVA Especial | Tax rate with special calculation |
| 08 | IVA Régimen de Bienes Usados | Bienes Usados | Tax factor from catalog |
| 12 | Impuesto Específico al Cemento | Cemento | Quantity, tax amount |
| 99 | Otros | Otros | Percentage or amount |

## Tax Type Requirements

The `TAX_TYPE_REQUIREMENTS` constant defines what fields are required for each tax type:

```typescript
{
  requiresTaxRate: boolean;      // Needs tax rate selection (IVA types)
  requiresAmount: boolean;        // Needs tax amount from catalog
  requiresFactor: boolean;        // Needs tax factor from catalog
  requiresSpecialFields: boolean; // Needs additional fields
  specialFields?: string[];       // List of required special fields
  description: string;            // User-friendly description
}
```

## Special Fields by Tax Type

### Tax Type 01 (IVA)
- **Tax Rate**: Required (select from catalog: 0%, 1%, 2%, 4%, 13%)
- **Calculation**: `amount = baseAmount × rate / 100`

### Tax Type 02 (ISC)
- **Percentage**: Required (custom percentage)
- **Calculation**: `amount = baseAmount × percentage / 100`

### Tax Type 03 (Combustibles)
- **Tax Amount**: Required (from catalog, specific to fuel type)
- **Calculation**: Backend uses catalog amount

### Tax Type 04 (Bebidas Alcohólicas)
- **Volume Consumption**: Required (ml)
- **Percentage**: Required (alcohol content %)
- **Tax Amount**: Required (from catalog based on alcohol content range)
- **Calculation**: `amount = volumeConsumption × (percentage / 100) × taxAmount`

### Tax Type 05 (Bebidas y Jabones)
- **Quantity**: Required (number of units or grams)
- **Tax Amount**: Required (from catalog based on product type)
- **Calculation**: `amount = quantity × taxAmount`

### Tax Type 06 (Tabaco)
- **Quantity**: Required (number of units)
- **Tax Amount**: Required (from catalog based on tariff code)
- **Calculation**: `amount = quantity × taxAmount`

### Tax Type 07 (IVA Especial)
- **Tax Rate**: Required (select from catalog)
- **Calculation**: Special IVA calculation formula

### Tax Type 08 (Bienes Usados)
- **Tax Factor**: Required (from catalog based on product type)
- **Calculation**: `amount = salePrice × factor`

### Tax Type 12 (Cemento)
- **Quantity**: Required (units)
- **Tax Amount**: Required (from catalog)
- **Calculation**: `amount = quantity × taxAmount`

### Tax Type 99 (Otros)
- **Percentage**: Required (custom percentage)
- **Other Tax Type**: Optional (description)
- **Calculation**: Custom based on percentage or amount

## UI Implementation

### Tax Selection
1. User selects tax type from dropdown (shows code + description)
2. Form automatically initializes required fields based on tax type
3. Validation ensures all required fields are filled

### Tax Configuration
Each tax type shows:
- Tax type header with code and description
- Requirement description (what fields are needed)
- Appropriate input fields based on requirements
- Alerts for catalog-dependent fields (amounts, factors)

### Field Validation
- Required fields are marked with asterisk (*)
- Numeric fields have appropriate step values (0.01 for decimals)
- Disabled fields show calculated or catalog values
- Clear button to remove tax

## Data Structure

### ProductTax Interface
```typescript
interface ProductTax {
  taxTypeId: string;              // Hacienda code (e.g., "01")
  code?: string;                  // Same as taxTypeId
  rate?: number;                  // For percentage-based taxes
  amount?: number;                // Calculated amount
  taxRateId?: string;             // Tax rate code from catalog
  taxFactorId?: string;           // Tax factor UUID from catalog
  factor?: number;                // Factor value
  otherTaxType?: string;          // For tax type 99
  specialFields?: {
    quantity?: number;
    percentage?: number;
    proportion?: number;
    volumeConsumption?: number;
    taxUnitAmount?: number;
    taxAmountId?: string;
  };
  isAmount: boolean;              // True if fixed amount, false if percentage
}
```

## Backend Integration

### Required Catalog Endpoints
- `GET /catalogs/tax-types` - List all tax types
- `GET /catalogs/tax-rates` - List all tax rates (for IVA)
- `GET /catalogs/tax-amounts` - List all tax amounts (for types 03, 04, 05, 06, 12)
- `GET /catalogs/tax-factors` - List all tax factors (for type 08)
- `GET /catalogs/taxes/{type}/factors` - Get factors for specific tax type

### Validation
Backend must validate:
1. Tax type code exists in catalog
2. Required fields are present based on tax type
3. Tax rate/amount/factor IDs exist in respective catalogs
4. Numeric values are within valid ranges
5. Special fields match tax type requirements

## Future Enhancements

1. **Catalog Integration**: Fetch tax amounts and factors from backend catalogs
2. **Real-time Calculation**: Show calculated tax amounts as user enters values
3. **Tax Templates**: Save common tax configurations for quick reuse
4. **Validation Messages**: Show specific error messages for missing required fields
5. **Help Text**: Add tooltips explaining each tax type and its requirements

## Testing Checklist

- [ ] All 10 tax types can be added
- [ ] Required fields show for each tax type
- [ ] Tax rates dropdown works for IVA types (01, 07)
- [ ] Special fields (quantity, volume, percentage) accept numeric input
- [ ] Alerts show for catalog-dependent fields
- [ ] Taxes can be removed
- [ ] Form validation prevents submission with incomplete taxes
- [ ] Tax data is correctly formatted in API request
