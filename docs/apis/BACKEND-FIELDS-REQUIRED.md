# Backend Fields Required for Tax Implementation

## Product Model Updates

The Product model needs to support the following tax-related fields:

### Tax Fields

```typescript
interface ProductTax {
  taxId?: number;              // Internal ID (for updates)
  taxTypeId: string;           // Tax type ID (from tax_types catalog)
  code?: string;               // Tax type code (01-08, 12, 99)
  taxRateId?: string;          // Tax rate ID (for IVA types 01, 07)
  taxFactorId?: string;        // Tax factor ID (for type 08 only)
  rate: number;                // Percentage or factor value
  amount?: number;             // Calculated amount (optional)
  isAmount?: boolean;          // True if using fixed amount vs percentage
  specialFields?: {
    quantity?: number;           // Quantity for calculation
    percentage?: number;         // Percentage (for type 04)
    volumeConsumption?: number;  // Volume in ml (for type 05)
    taxAmountId?: string;        // Tax amount catalog ID
  };
}

interface Product {
  // ... existing fields ...
  taxes?: ProductTax[];        // Array of taxes
}
```

## Database Schema

### Products Table

Add JSON column for taxes:

```sql
ALTER TABLE products 
ADD COLUMN taxes JSONB DEFAULT '[]'::jsonb;
```

### Catalog Tables

The following catalog tables must exist and be populated:

#### 1. tax_types
```sql
CREATE TABLE tax_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Required Data:**
- 01: Impuesto al Valor Agregado (IVA)
- 02: Impuesto Selectivo de Consumo (ISC)
- 03: Impuesto Único a los Combustibles (IUC)
- 04: Impuesto Específico de Bebidas Alcohólicas (ISEBA)
- 05: Impuesto Específico sobre Bebidas Envasadas (ISEBEC)
- 06: Impuesto a los Productos de Tabaco (IPT)
- 07: IVA (cálculo especial) (IVACE)
- 08: IVA Régimen de Bienes Usados (IVARBU)
- 12: Impuesto Específico al Cemento (ISEC)
- 99: Otros

#### 2. tax_rates
```sql
CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Required Data:**
- 01: Tarifa 0% (Exento) - 0.00%
- 02: Tarifa Reducida 1% - 1.00%
- 03: Tarifa Reducida 2% - 2.00%
- 04: Tarifa Reducida 4% - 4.00%
- 07: Tarifa Reducida (Transitoria) - 2.00%
- 08: Tarifa General 13% - 13.00%

#### 3. tax_factors
```sql
CREATE TABLE tax_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  factor DECIMAL(10,5) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Required Data (for type 08 - Used Goods):**
- Factor IVA Bienes Usados - Artículos electrónicos: 0.058
- Factor IVA Bienes Usados - Herramientas: 0.05
- Factor IVA Bienes Usados - Línea Blanca: 0.044
- Factor IVA Bienes Usados - Antigüedades: 0.065

#### 4. tax_amounts
```sql
CREATE TABLE tax_amounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_type_id UUID REFERENCES tax_types(id),
  name TEXT NOT NULL,
  amount DECIMAL(10,5) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Required Data:**

**Type 03 (IUC - Fuel Tax):**
- Gasolina regular: 259.50
- Gasolina súper: 271.75
- Diésel: 153.75
- Asfalto: 52.75
- Emulsión asfáltica: 40.00
- Búnker: 25.25
- LPG: 24.00
- Jet fuel A1: 155.75
- Av. gas: 259.50
- Queroseno: 74.00
- Diésel pesado (gasóleo): 50.75
- Nafta pesada: 37.50
- Nafta liviana: 37.50

**Type 04 (ISEBA - Alcoholic Beverages):**
- Hasta 15%: 3.66
- Más de 15% y hasta 30%: 4.36
- Más de 30%: 5.10

**Type 05 (ISEBEC - Packaged Beverages):**
- Bebidas gaseosas y concentrados: 21.79
- Otras bebidas líquidas envasadas: 16.17
- Agua (envases 18L o más): 7.53
- Jabón de tocador (por gramo): 0.276

**Type 06 (IPT - Tobacco):**
- 24.01 Tabaco en rama: 26.92
- 24.02 Cigarros y cigarrillos: 26.92
- 24.03 Otros tabacos elaborados: 26.92

#### 5. product_types
```sql
CREATE TABLE product_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Required Data:**
- 01: Bien
- 02: Servicio
- 03: Mercancía

#### 6. measurement_units
```sql
CREATE TABLE measurement_units (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  commercial_unit VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Required Data (minimum):**
- 85: Unid - Unidad - Unid

## API Endpoints Required

### Catalog Endpoints

```
GET /api/users/{userId}/organizations/{orgId}/catalogs/tax-types
GET /api/users/{userId}/organizations/{orgId}/catalogs/tax-rates
GET /api/users/{userId}/organizations/{orgId}/catalogs/tax-factors
GET /api/users/{userId}/organizations/{orgId}/catalogs/tax-amounts?taxTypeId={taxTypeId}
GET /api/users/{userId}/organizations/{orgId}/catalogs/product-types
GET /api/users/{userId}/organizations/{orgId}/catalogs/measurement-units
```

### Response Formats

**Tax Types:**
```json
[
  {
    "id": "uuid",
    "code": "01",
    "name": "Impuesto al Valor Agregado"
  }
]
```

**Tax Rates:**
```json
[
  {
    "id": "uuid",
    "code": "08",
    "name": "Tarifa General 13%",
    "rate": 13.0
  }
]
```

**Tax Factors:**
```json
[
  {
    "id": "uuid",
    "name": "Factor IVA Bienes Usados - Artículos electrónicos",
    "factor": 0.058
  }
]
```

**Tax Amounts:**
```json
[
  {
    "id": "uuid",
    "name": "Impuesto Único Combustibles - Gasolina regular",
    "amount": 259.50
  }
]
```

## Product API Updates

### Create/Update Product

The product endpoint should accept taxes array:

```json
{
  "name": "Product Name",
  "price": 100.00,
  "taxes": [
    {
      "taxTypeId": "uuid-of-tax-type-01",
      "code": "01",
      "taxRateId": "uuid-of-rate-08",
      "rate": 13.0,
      "isAmount": false
    },
    {
      "taxTypeId": "uuid-of-tax-type-03",
      "code": "03",
      "specialFields": {
        "quantity": 1,
        "taxAmountId": "uuid-of-fuel-amount"
      },
      "isAmount": true
    }
  ]
}
```

### Get Product

The product response should include taxes:

```json
{
  "productId": "uuid",
  "name": "Product Name",
  "price": 100.00,
  "taxes": [
    {
      "taxId": 1,
      "taxTypeId": "uuid",
      "code": "01",
      "taxRateId": "uuid",
      "rate": 13.0,
      "amount": 13.00,
      "isAmount": false
    }
  ]
}
```

## Validation Rules

### Backend Validation

1. **Tax Type Validation:**
   - taxTypeId must exist in tax_types table
   - code must match the tax type code

2. **Tax Rate Validation (for types 01, 07):**
   - taxRateId must exist in tax_rates table
   - rate must match the tax rate value

3. **Tax Factor Validation (for type 08):**
   - taxFactorId must exist in tax_factors table
   - rate must match the factor value

4. **Special Fields Validation:**
   - Type 03: requires quantity and taxAmountId
   - Type 04: requires quantity, percentage, and taxAmountId
   - Type 05: requires quantity, volumeConsumption, and taxAmountId
   - Type 06: requires quantity and taxAmountId

5. **CABYS Validation:**
   - Type 05 (ISEBEC) only valid for CABYS starting with 2202 or 3401
   - Type 06 (IPT) only valid for CABYS starting with 2401, 2402, or 2403

## Migration Script

```sql
-- Add taxes column to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS taxes JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_taxes ON products USING GIN (taxes);

-- Create catalog tables
-- (See individual table definitions above)

-- Seed catalog data
-- (See required data sections above)
```

## Notes

- All tax calculations should be performed on the frontend for preview
- Backend should validate and store the tax configuration
- Tax amounts are calculated at invoice/order creation time, not at product level
- The `amount` field in ProductTax is optional and used for display purposes only
- Actual tax calculations for invoices should use the tax configuration stored in the product
