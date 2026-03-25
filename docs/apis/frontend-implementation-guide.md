# Frontend Implementation Guide: Product Excel Import

## Overview

This guide provides the specifications needed to implement the product Excel import feature on the frontend. The backend API endpoint accepts Excel files and returns a list of created/updated products.

## API Endpoint

### POST `/api/organizations/{organization_id}/products/parse`

Upload an Excel file to create or update products in bulk.

**Path Parameters:**
- `organization_id` (string, required): Organization identifier

**Request Body:**
```typescript
{
  "data": string,           // Base64-encoded Excel file (required)
  "name"?: string,          // File name without extension (optional)
  "contentType"?: string    // MIME type (optional, e.g., "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
}
```

**Response (200 OK):**
```typescript
{
  "data": ProductResponse[],
  "pagination": {
    "page": number,
    "pageSize": number,      // Total products processed
    "totalElements": number, // Total created + updated
    "totalPages": number     // Always 1
  }
}
```

**Error Response (400 Bad Request):**
```typescript
{
  "detail": string  // Error message (e.g., "Could not open Excel file: Invalid file format")
}
```

**Error Response (422 Unprocessable Entity):**
```typescript
{
  "detail": string  // Validation error message
}
```

**Error Response (500 Internal Server Error):**
```typescript
{
  "detail": string  // System error message
}
```

## ProductResponse Type

```typescript
interface ProductResponse {
  productId: string;
  companyId: string;
  name?: string;
  description?: string;
  unitsPerBox?: number;
  price?: number;
  imageUrl?: string;
  category?: {
    categoryId: string;
    name?: string;
  };
  cabys?: {
    id: string;
    code: string;
    name: string;
    type: number;
  };
  unitId?: number;
  commercialUnitMeasure?: string;
  isPackaged?: boolean;
  quantity?: number;
  unitPrice?: number;
  customsPart?: string;
  codes?: Array<{
    codeTypeId: string;
    number: string;
    description?: string;
  }>;
  discounts?: Array<{
    discountTypeId: string;
    percentage?: number;
    amount?: number;
    reason?: string;
    isAmount?: boolean;
  }>;
  taxes?: Array<{
    taxTypeId: string;
    amount?: number;
    taxRate?: {
      id?: string;
      percentage: number;
    };
    taxFactor?: {
      id: string;
      factor: number;
    };
    otherTaxType?: string;
    specialFields?: {
      quantity?: number;
      percentage?: number;
      proportion?: number;
      volumeConsumption?: number;
      taxAmount?: {
        id: string;
        amount: number;
      };
    };
    isAmount?: boolean;
  }>;
  baseAmount?: number;
  salePrice?: number;
}
```

## Excel File Format

The Excel file must contain the following headers (case-sensitive):

| Header | Description | Required | Notes |
|--------|-------------|----------|-------|
| COD_ARTIC | Vendor/article code | Yes | Maps to Hacienda code type 01 |
| COD_BARRA | Barcode | Yes | Maps to Hacienda code type 03 |
| COD_INTERNO | Internal code | Yes | Maps to Hacienda code type 04 |
| DESCRIPCION | Product description | Yes | Used as product name and description |
| CANTIDAD_CAJA | Units per box | No | Numeric value |
| UNIDAD_MEDIDA | Unit of measure | No | Text value |
| PRECIO | Price | No | **Ignored by backend** (not used for create/update) |
| CATEGORIA | Category name | No | Case-insensitive lookup |

**Example Excel Structure:**
```
COD_ARTIC         | COD_BARRA      | COD_INTERNO | DESCRIPCION                    | CANTIDAD_CAJA | UNIDAD_MEDIDA | PRECIO | CATEGORIA
17441119600000    | 7441119600003  | 2648022     | JUEGO SABANA BEBE BLANCA DOCOMA| 3.00          |               | 0.00   | Bebé
17441119600017    | 7441119600010  | 2645670     | JUEGO SABANA BEBE CELESTE DOCOMA| 3.00         |               | 0.00   | Bebé
```

## Frontend Implementation Steps

### 1. File Upload Component

Create a file upload component that:
- Accepts only `.xlsx` and `.xls` files
- Validates file size (recommend max 5MB)
- Converts file to base64 string
- Shows upload progress indicator

```typescript
async function uploadProductExcel(file: File, organizationId: string): Promise<ProductListResponse> {
  // Convert file to base64
  const base64 = await fileToBase64(file);
  
  // Make API request
  const response = await fetch(`/api/organizations/${organizationId}/products/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: base64,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      contentType: file.type
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }
  
  return response.json();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}
```

### 2. Results Display

After successful upload, display:
- Total products processed (from `pagination.totalElements`)
- List of created/updated products (from `data` array)
- Option to view product details
- Option to download results as CSV/Excel

```typescript
interface ImportResults {
  totalProcessed: number;
  products: ProductResponse[];
}

function displayResults(response: ProductListResponse): ImportResults {
  return {
    totalProcessed: response.pagination.totalElements,
    products: response.data
  };
}
```

### 3. Error Handling

Handle different error scenarios:

```typescript
try {
  const results = await uploadProductExcel(file, organizationId);
  // Show success message
  showSuccessMessage(`Successfully processed ${results.pagination.totalElements} products`);
  // Display results
  displayProductList(results.data);
} catch (error) {
  if (error.message.includes('Could not open Excel file')) {
    showErrorMessage('Invalid Excel file format. Please upload a valid .xlsx or .xls file.');
  } else if (error.message.includes('headers')) {
    showErrorMessage('Excel file is missing required headers. Please check the file format.');
  } else {
    showErrorMessage(`Upload failed: ${error.message}`);
  }
}
```

### 4. User Feedback

Provide clear feedback during the process:

1. **Before Upload:**
   - Show file requirements (format, headers, max size)
   - Provide downloadable template Excel file

2. **During Upload:**
   - Show loading spinner
   - Display "Processing..." message
   - Disable upload button

3. **After Upload:**
   - Show success message with count
   - Display list of processed products
   - Highlight any products that were updated vs created (check if product already had an ID)
   - Provide option to export results

### 5. Template Download

Provide a template Excel file for users:

```typescript
function downloadTemplate() {
  const headers = [
    'COD_ARTIC',
    'COD_BARRA',
    'COD_INTERNO',
    'DESCRIPCION',
    'CANTIDAD_CAJA',
    'UNIDAD_MEDIDA',
    'PRECIO',
    'CATEGORIA'
  ];
  
  // Create CSV or Excel file with headers
  // Provide example row
  const exampleRow = [
    '17441119600000',
    '7441119600003',
    '2648022',
    'JUEGO SABANA BEBE BLANCA DOCOMA',
    '3.00',
    '',
    '0.00',
    'Bebé'
  ];
  
  // Generate and download file
  // ... implementation depends on your library (e.g., xlsx, papaparse)
}
```

## Important Notes

### Backend Behavior

1. **Product Matching:**
   - Backend searches for existing products using COD_INTERNO, COD_BARRA, or COD_ARTIC
   - Priority: COD_INTERNO > COD_BARRA > COD_ARTIC
   - If match found → updates category only
   - If no match → creates new product

2. **Price Handling:**
   - PRECIO column in Excel is **ignored**
   - Existing product prices are **never modified**
   - New products are created with default price (0)

3. **Category Handling:**
   - Category lookup is case-insensitive
   - If category doesn't exist, backend creates a new category with that name
   - If category name is empty, uses default "uncategorized" category
   - Only the category field is updated for existing products

4. **Error Handling:**
   - Each row is processed independently
   - Row errors don't stop processing of other rows
   - Successfully processed products are returned even if some rows fail
   - Errors are logged on backend but not returned in API response

### UI/UX Recommendations

1. **File Validation:**
   - Validate file extension before upload
   - Check file size (recommend 5MB max)
   - Show clear error messages for invalid files

2. **Progress Indication:**
   - Show loading state during upload
   - Display processing message
   - Disable multiple simultaneous uploads

3. **Results Display:**
   - Show total count prominently
   - List all processed products
   - Provide filtering/sorting options
   - Allow export of results

4. **Help Documentation:**
   - Provide template download
   - Show example Excel format
   - Explain required headers
   - Document that prices are not imported

5. **Confirmation:**
   - Consider showing preview before import
   - Warn about category-only updates
   - Confirm before processing large files

## Example React Component

```typescript
import React, { useState } from 'react';

interface ProductImportProps {
  organizationId: string;
  onSuccess?: (products: ProductResponse[]) => void;
}

export function ProductImport({ organizationId, onSuccess }: ProductImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProductResponse[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const response = await uploadProductExcel(file, organizationId);
      setResults(response.data);
      onSuccess?.(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-import">
      <h2>Import Products from Excel</h2>
      
      <div className="upload-section">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={loading}
        />
        
        <button
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? 'Processing...' : 'Upload'}
        </button>
        
        <button onClick={downloadTemplate}>
          Download Template
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {results && (
        <div className="results">
          <h3>Import Complete</h3>
          <p>Successfully processed {results.length} products</p>
          <ul>
            {results.map(product => (
              <li key={product.productId}>
                {product.name || product.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Testing Checklist

- [ ] File upload accepts .xlsx and .xls files
- [ ] File upload rejects other file types
- [ ] File size validation works (max 5MB)
- [ ] Base64 encoding works correctly
- [ ] API request includes correct headers
- [ ] Success response displays product count
- [ ] Success response displays product list
- [ ] Error responses show appropriate messages
- [ ] Loading state displays during upload
- [ ] Upload button is disabled during processing
- [ ] Template download works
- [ ] Results can be exported
- [ ] Large files are handled gracefully
- [ ] Network errors are handled properly

## Support

For backend API issues or questions about the endpoint behavior, refer to:
- Requirements: `.kiro/specs/product-excel-import/requirements.md`
- Design: `.kiro/specs/product-excel-import/design.md`
- Tasks: `.kiro/specs/product-excel-import/tasks.md`
