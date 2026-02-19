# Backend Changes Required for Product Module

## Database Schema Changes

### Products Table

Add new columns to support complete product structure:

```sql
-- Fiscal Information
ALTER TABLE products ADD COLUMN cabys VARCHAR(13);
ALTER TABLE products ADD COLUMN cabys_description TEXT;
ALTER TABLE products ADD COLUMN product_type_id INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN unit_id INTEGER DEFAULT 85;
ALTER TABLE products ADD COLUMN commercial_unit_measure VARCHAR(50);

-- Packaging
ALTER TABLE products ADD COLUMN is_packaged BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN quantity DECIMAL(10,3) DEFAULT 1;
ALTER TABLE products ADD COLUMN unit_price DECIMAL(10,5);

-- Customs
ALTER TABLE products ADD COLUMN customs_part VARCHAR(50);

-- Complex fields (JSON)
ALTER TABLE products ADD COLUMN codes JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN discounts JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN taxes JSONB DEFAULT '[]';

-- Calculated values
ALTER TABLE products ADD COLUMN original_price DECIMAL(10,5); -- Rename from netPrice
ALTER TABLE products ADD COLUMN base_amount DECIMAL(10,5);
ALTER TABLE products ADD COLUMN sale_price DECIMAL(10,5);

-- Remove old price field or rename it
-- Keep existing 'price' field as the original product price
```

## JSON Structure Definitions

### ProductCode Structure
```json
{
  "codeTypeId": 1,
  "number": "ABC123",
  "description": "Internal code"
}
```

### ProductDiscount Structure
```json
{
  "discountTypeId": 1,
  "percentage": 10.0,
  "amount": 1000.0,
  "reason": "Volume discount",
  "isAmount": false
}
```

**Discount Calculation Logic:**
- If `isAmount = true`: Use `amount` as fixed discount value
- If `isAmount = false`: Calculate discount as `originalPrice * percentage / 100`
- Either `percentage` or `amount` must be provided (not both required)

### ProductTax Structure
```json
{
  "taxTypeId": 1,
  "code": "01",
  "rate": 13.0,
  "amount": 1300.0,
  "taxRateId": 8,
  "taxFactorId": null,
  "factor": null,
  "otherTaxType": null,
  "specialFields": {
    "quantity": 10.0,
    "percentage": 13.0,
    "proportion": 0.5,
    "volumeConsumption": 100.0,
    "taxUnitAmount": 1300.0,
    "taxAmountId": 1
  },
  "isAmount": false
}
```

**Tax Calculation Logic:**
- IVA (code 01, 07, 08): Calculate from `baseAmount * rate / 100`
- Special taxes (code 02-06, 12): Use `specialFields` for complex calculations
- Others (code 99): Calculate from `baseAmount * rate / 100`
- `specialFields` required for: IUC (03), ISEBA (04), ISEBEC (05), IPT (06)

## API Endpoints Changes

### GET /products/:id
**Response should include:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "Description",
  "price": 10000.00,
  "categoryId": "uuid",
  "imageUrl": "url",
  "isActive": true,
  "sku": "SKU123",
  "stockQuantity": 100,
  "lowStockThreshold": 10,
  "trackInventory": true,
  "internalCode": "INT001",
  "originalCode": "ORG001",
  "clientArticleCode": "CLI001",
  "code": "CODE001",
  "unitsPerBox": 12,
  "cabys": "1234567890123",
  "cabysDescription": "Product CABYS description",
  "productTypeId": 1,
  "unitId": 85,
  "commercialUnitMeasure": "Unidad",
  "isPackaged": false,
  "quantity": 1,
  "unitPrice": 10000.00,
  "customsPart": "1234.56.78",
  "codes": [
    {
      "codeTypeId": 1,
      "number": "ABC123",
      "description": "Internal code"
    }
  ],
  "discounts": [
    {
      "discountTypeId": 1,
      "percentage": 10.0,
      "amount": null,
      "reason": null,
      "isAmount": false
    }
  ],
  "taxes": [
    {
      "taxTypeId": 1,
      "code": "01",
      "rate": 13.0,
      "amount": null,
      "taxRateId": 8,
      "taxFactorId": null,
      "factor": null,
      "otherTaxType": null,
      "specialFields": null,
      "isAmount": false
    }
  ],
  "baseAmount": 9000.00,
  "salePrice": 10170.00,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### POST /products
### PUT /products/:id
**Request body should accept all fields above**

## Calculation Flow (Backend)

### Product Calculations
```
1. price = base product price (user input)
2. totalAmount = price * quantity (for packaged products)
3. discountAmount = sum of all discount amounts
   - If discount.isAmount: use discount.amount
   - Else: price * discount.percentage / 100
4. subtotal = totalAmount - discountAmount
5. baseAmount = subtotal (or manual input for IVACE tax code 07)
6. Process special taxes (ISC-02, IUC-03, ISEBA-04, ISEBEC-05, IPT-06, ISEC-12):
   - Calculate tax amount
   - Add to netTax and totalAmountLine
   - For taxes with for_base_amount=true (ISC, ISEBA, ISEBEC, ISEC): baseAmount += taxAmount
7. Process OTHERS taxes (code 99):
   - Calculate: baseAmount * rate / 100
   - Add to netTax and totalAmountLine
8. Process IVA taxes (IVA-01, IVACE-07, IVARBU-08):
   - IVA/IVACE: baseAmount * rate / 100
   - IVARBU: factor * subtotal
   - Add to netTax and totalAmountLine
9. salePrice = totalAmountLine
```

### Tax Processing Order (CRITICAL)
**Must process in this exact order:**
1. Special taxes first (they may add to baseAmount)
2. OTHERS taxes second (use accumulated baseAmount)
3. IVA taxes last (use final baseAmount)

### Special Tax Calculations

#### IUC (03) - Impuesto Único a los Combustibles
```
amount = specialFields.quantity * specialFields.taxUnitAmount
```
- `quantity`: Cantidad de la unidad de medida a utilizar
- `taxUnitAmount`: Impuesto por Unidad (from taxAmountId catalog)

#### ISEBA (04) - Impuesto Específico de Bebidas Alcohólicas
```
proportion = specialFields.quantity * specialFields.percentage / 100
amount = detailQuantity * proportion * specialFields.taxUnitAmount
```
- `quantity`: Cantidad de la unidad de medida a utilizar
- `percentage`: Porcentaje
- `proportion`: Calculated field (quantity * percentage / 100)
- `taxUnitAmount`: Impuesto por Unidad (from taxAmountId catalog)
- `detailQuantity`: Product quantity from detail line

#### ISEBEC (05) - Impuesto Específico sobre Bebidas Envasadas
**For non-alcoholic beverages (CABYS starts with '2202'):**
```
altAmount = specialFields.taxUnitAmount / specialFields.volumeConsumption
amount = detailQuantity * specialFields.quantity * altAmount
```

**For other products:**
```
amount = specialFields.quantity * specialFields.volumeConsumption * specialFields.taxUnitAmount
```
- `quantity`: Cantidad de la unidad de medida a utilizar
- `volumeConsumption`: Volumen por Unidad de Consumo
- `taxUnitAmount`: Impuesto por Unidad (from taxAmountId catalog)
- `detailQuantity`: Product quantity from detail line

#### IPT (06) - Impuesto a los Productos de Tabaco
```
amount = detailQuantity * specialFields.quantity * specialFields.taxUnitAmount
```
- `quantity`: Cantidad de la unidad de medida a utilizar
- `taxUnitAmount`: Impuesto por Unidad (from taxAmountId catalog)
- `detailQuantity`: Product quantity from detail line

#### ISC (02) - Impuesto Selectivo de Consumo
```
amount = subtotal * rate / 100
```
- Uses `rate` field (no specialFields)
- Adds to baseAmount

#### ISEC (12) - Impuesto Específico al Cemento
```
amount = subtotal * rate / 100
```
- Fixed rate: 5.0%
- Adds to baseAmount

#### OTHERS (99) - Otros Impuestos
```
amount = baseAmount * rate / 100
```
- Uses accumulated baseAmount (after special taxes)

#### IVA (01) - Impuesto al Valor Agregado
```
amount = baseAmount * rate / 100
```
- Uses final baseAmount (after all special taxes)

#### IVACE (07) - IVA Cálculo Especial
```
amount = baseAmount * rate / 100
```
- `baseAmount` is manually provided (not calculated)
- User must input baseAmount when using IVACE

#### IVARBU (08) - IVA Régimen de Bienes Usados
```
amount = factor * subtotal
```
- Uses `factor` field instead of `rate`
- Requires `taxFactorId` from catalog

### Base Amount Accumulation
These tax types add their amount to baseAmount:
- **02 (ISC)**: Impuesto Selectivo de Consumo
- **04 (ISEBA)**: Impuesto Específico de Bebidas Alcohólicas  
- **05 (ISEBEC)**: Impuesto Específico sobre Bebidas Envasadas
- **12 (ISEC)**: Impuesto Específico al Cemento

This ensures IVA is calculated on: `subtotal + special_taxes_amount`

### Validation Rules

**Discounts:**
- Maximum 5 discounts per product
- Total discount percentage cannot exceed 100%
- Either `percentage` or `amount` must be provided
- If `discountTypeId = 99` (Other), `reason` is required (min 5 characters)

**Taxes:**
- `rate` is required unless `specialFields` is provided
- IVA taxes (codes 01, 07, 08) require `taxRateId`
- Special taxes (codes 03-06) require `specialFields` with `taxAmountId`
- Code 99 (Others) requires `otherTaxType` description
- **Tax processing order matters**: Special taxes → OTHERS → IVA
- Special taxes with `for_base_amount=true` (02, 04, 05, 12) add their amount to baseAmount before IVA calculation

**CABYS:**
- Must be exactly 13 digits
- Required for tax calculations
- Should validate against Hacienda API

**Packaging:**
- If `isPackaged = true`, `quantity` and `unitPrice` are required
- `price` is calculated as `quantity * unitPrice` for packaged products

## Migration Script Example

```sql
-- Step 1: Add new columns
ALTER TABLE products 
  ADD COLUMN cabys VARCHAR(13),
  ADD COLUMN cabys_description TEXT,
  ADD COLUMN product_type_id INTEGER DEFAULT 1,
  ADD COLUMN unit_id INTEGER DEFAULT 85,
  ADD COLUMN commercial_unit_measure VARCHAR(50),
  ADD COLUMN is_packaged BOOLEAN DEFAULT FALSE,
  ADD COLUMN quantity DECIMAL(10,3) DEFAULT 1,
  ADD COLUMN unit_price DECIMAL(10,5),
  ADD COLUMN customs_part VARCHAR(50),
  ADD COLUMN codes JSONB DEFAULT '[]',
  ADD COLUMN discounts JSONB DEFAULT '[]',
  ADD COLUMN taxes JSONB DEFAULT '[]',
  ADD COLUMN base_amount DECIMAL(10,5),
  ADD COLUMN sale_price DECIMAL(10,5);

-- Step 2: Update existing products with default values
UPDATE products 
SET 
  product_type_id = 1,
  unit_id = 85,
  is_packaged = FALSE,
  quantity = 1,
  codes = '[]',
  discounts = '[]',
  taxes = '[]'
WHERE product_type_id IS NULL;

-- Step 4: Calculate initial sale_price from original_price
UPDATE products 
SET sale_price = price 
WHERE sale_price IS NULL;
```

## TypeScript Types (Backend Reference)

```typescript
interface ProductCode {
  codeTypeId: number;
  number: string;
  description?: string;
}

interface ProductDiscount {
  discountTypeId: number;
  percentage?: number;
  amount?: number;
  reason?: string;
  isAmount?: boolean;
}

interface TaxSpecialFields {
  quantity?: number;
  percentage?: number;
  proportion?: number;
  volumeConsumption?: number;
  taxUnitAmount?: number;
  taxAmountId?: number;
}

interface ProductTax {
  taxTypeId: number;
  code?: string;
  rate?: number;
  amount?: number;
  taxRateId?: number;
  taxFactorId?: number;
  factor?: number;
  otherTaxType?: string;
  specialFields?: TaxSpecialFields;
  isAmount?: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base product price
  categoryId: string;
  imageUrl: string | null;
  isActive: boolean;
  sku?: string | null;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  internalCode?: string | null;
  originalCode?: string | null;
  clientArticleCode?: string | null;
  code?: string | null;
  unitsPerBox?: number | null;
  cabys?: string | null;
  cabysDescription?: string | null;
  productTypeId?: number;
  unitId?: number;
  commercialUnitMeasure?: string | null;
  isPackaged?: boolean;
  quantity?: number;
  unitPrice?: number;
  customsPart?: string | null;
  codes?: ProductCode[];
  discounts?: ProductDiscount[];
  taxes?: ProductTax[];
  baseAmount?: number;
  salePrice?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Notes

1. **price field**: Keep existing `price` field as the base product price before any calculations.

2. **Calculation Order**: Always calculate in this order:
   - price (base)
   - Apply discounts → subtotal
   - Calculate baseAmount (subtotal or manual for IVACE)
   - Apply taxes → salePrice

3. **JSONB Fields**: Use PostgreSQL JSONB for flexible storage of codes, discounts, and taxes arrays.

4. **Backward Compatibility**: Existing `price` field is used as the base price for all calculations.

5. **Frontend Integration**: Frontend already implements these structures and calculations. Backend needs to match.
