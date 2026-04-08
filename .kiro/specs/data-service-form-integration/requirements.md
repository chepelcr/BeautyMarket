# Requirements Document

## Introduction

This feature integrates the existing data API service with the ClientForm and ProductForm components to replace hardcoded values with dynamic data from the centralized data API. The data API client already provides comprehensive endpoints for customer types, document types, location hierarchies, currencies, taxes, discount types, and codes. The integration will eliminate data duplication, ensure consistency across forms, and leverage the existing React Query hooks for efficient data fetching and caching.

## Glossary

- **Data_API_Client**: The service class at `dashboard/src/services/data-api/client.ts` that provides methods to fetch reference data from the data API
- **useDataApi_Hook**: The React Query wrapper hooks at `dashboard/src/hooks/useDataApi.ts` that provide caching and state management for data API calls
- **CustomerForm**: The customer form component at `dashboard/src/components/customers/CustomerForm.tsx` for creating and editing customer records
- **ProductForm**: The product form component at `dashboard/src/components/admin/product-form.tsx` for creating and editing product records
- **Product_Sections**: The modular form sections within ProductForm including CodesSection, DiscountsSection, and AdvancedTaxesSection
- **Reference_Data**: Static or semi-static data like customer types, document types, tax types, discount types, and location hierarchies
- **Hardcoded_Values**: Static values embedded directly in form components that should be replaced with dynamic API data
- **Location_Hierarchy**: The nested structure of Country → State → County → District → Neighborhood used for address data
- **ISO_Code**: The country code parameter (e.g., "CR" for Costa Rica) required by many data API endpoints

## Requirements

### Requirement 1: Replace CustomerForm Hardcoded Values with Data API

**User Story:** As a developer, I want CustomerForm to use dynamic data from the data API, so that customer identification types, nationalities, phone codes, and location data are always current and consistent.

#### Acceptance Criteria

1. WHEN CustomerForm renders, THE Form SHALL fetch document types using useAllDocumentTypes hook with the organization's ISO code
2. WHEN CustomerForm renders, THE Form SHALL fetch countries using useAllCountries hook for nationality selection
3. WHEN a country is selected for nationality, THE Form SHALL populate phone country codes from the selected country data
4. WHEN CustomerForm renders with a selected country, THE Form SHALL fetch states using useStates hook with the ISO code
5. WHEN a state is selected, THE Form SHALL fetch counties using useCounties hook with ISO code and state ID
6. WHEN a county is selected, THE Form SHALL fetch districts using useDistricts hook with ISO code, state ID, and county ID
7. WHEN a district is selected, THE Form SHALL fetch neighborhoods using useNeighborhoods hook with ISO code, state ID, county ID, and district ID
8. THE Form SHALL remove all hardcoded identification type values
9. THE Form SHALL remove all hardcoded nationality values
10. THE Form SHALL remove all hardcoded phone code values
11. THE Form SHALL remove all hardcoded location ID values

### Requirement 2: Replace ProductForm CodesSection Hardcoded Values

**User Story:** As a developer, I want ProductForm CodesSection to use dynamic code types from the data API, so that product code classifications are consistent with the centralized data service.

#### Acceptance Criteria

1. WHEN CodesSection renders, THE Section SHALL fetch code types using useAllCodes hook with the organization's ISO code
2. THE Section SHALL replace the hardcoded CODE_TYPES array with data from the API response
3. WHEN displaying code type options, THE Section SHALL use the code type's code and description fields from the API
4. THE Section SHALL maintain the existing UI behavior for adding, removing, and displaying codes
5. IF the API request fails, THEN THE Section SHALL display an error message and disable code selection

### Requirement 3: Replace ProductForm DiscountsSection Hardcoded Values

**User Story:** As a developer, I want ProductForm DiscountsSection to use dynamic discount types from the data API, so that discount classifications are consistent with the centralized data service.

#### Acceptance Criteria

1. WHEN DiscountsSection renders, THE Section SHALL fetch discount types using useAllDiscountTypes hook with the organization's ISO code
2. THE Section SHALL replace the hardcoded DISCOUNT_TYPES array with data from the API response
3. WHEN displaying discount type options, THE Section SHALL use the discount type's code and description fields from the API
4. THE Section SHALL maintain the existing UI behavior for adding, removing, and calculating discounts
5. THE Section SHALL preserve the special handling for discount type code "99" (Otro/Other)
6. IF the API request fails, THEN THE Section SHALL display an error message and disable discount selection

### Requirement 4: Integrate Data API with AdvancedTaxesSection

**User Story:** As a developer, I want AdvancedTaxesSection to use tax types and tax rates from the data API, so that tax calculations use centralized reference data.

#### Acceptance Criteria

1. WHEN AdvancedTaxesSection renders, THE Section SHALL fetch tax types using useAllTaxes hook with the organization's ISO code
2. WHEN AdvancedTaxesSection renders, THE Section SHALL fetch tax rates using useAllTaxRates hook with the organization's ISO code
3. THE Section SHALL replace existing organization-specific API calls with data API calls
4. THE Section SHALL maintain compatibility with existing tax calculation logic
5. THE Section SHALL preserve all special tax type handling (IVA, IVACE, IVARBU, IUC, ISEBA, IPT, ISEBEC)
6. IF the data API request fails, THEN THE Section SHALL fall back to organization-specific API calls

### Requirement 5: Implement Cascading Location Selectors in CustomerForm

**User Story:** As a user, I want location fields to update automatically based on my selections, so that I can efficiently enter accurate address information.

#### Acceptance Criteria

1. WHEN a country is selected, THE Form SHALL clear and disable state, county, district, and neighborhood fields
2. WHEN a state is selected, THE Form SHALL clear and disable county, district, and neighborhood fields
3. WHEN a county is selected, THE Form SHALL clear and disable district and neighborhood fields
4. WHEN a district is selected, THE Form SHALL clear and disable neighborhood field
5. WHILE a parent location is not selected, THE Form SHALL disable child location selectors
6. WHEN location data is loading, THE Form SHALL display loading indicators in the affected selectors
7. THE Form SHALL enable each location selector only after its parent location is selected and data is loaded

### Requirement 6: Handle Data API Loading and Error States

**User Story:** As a user, I want clear feedback when reference data is loading or fails to load, so that I understand the form's state and can take appropriate action.

#### Acceptance Criteria

1. WHILE reference data is loading, THE Form SHALL display loading indicators in affected form fields
2. WHILE reference data is loading, THE Form SHALL disable affected form fields
3. IF a data API request fails, THEN THE Form SHALL display an error message near the affected field
4. IF a data API request fails, THEN THE Form SHALL provide a retry mechanism
5. WHEN retrying a failed request, THE Form SHALL clear the previous error message
6. THE Form SHALL allow users to continue filling other fields while reference data loads
7. IF critical reference data fails to load, THEN THE Form SHALL disable form submission

### Requirement 7: Preserve useDataApi Hook Abstraction Layer

**User Story:** As a developer, I want to use the useDataApi hooks instead of calling the client directly, so that I benefit from React Query's caching, loading states, and error handling.

#### Acceptance Criteria

1. THE Form_Components SHALL use hooks from useDataApi.ts rather than calling dataApiClient directly
2. THE Hooks SHALL provide isLoading, isError, and error states to components
3. THE Hooks SHALL leverage React Query's automatic caching and refetching
4. THE Hooks SHALL accept optional React Query configuration options
5. THE Components SHALL handle loading and error states provided by the hooks
6. THE Implementation SHALL not duplicate hook logic in form components

### Requirement 8: Maintain Form Validation and Submission Logic

**User Story:** As a developer, I want form validation and submission to work correctly with dynamic data, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN a form is submitted, THE Form SHALL validate that all required reference data fields are populated
2. WHEN a form is submitted, THE Form SHALL use the ID values from the selected reference data items
3. THE Form SHALL maintain existing validation rules for all fields
4. THE Form SHALL prevent submission while reference data is loading
5. IF reference data fails to load, THEN THE Form SHALL prevent submission of affected fields
6. THE Form SHALL display validation errors for missing required reference data selections

### Requirement 9: Support Organization-Specific ISO Code Context

**User Story:** As a developer, I want forms to automatically use the correct ISO code for data API requests, so that users see data relevant to their organization's country.

#### Acceptance Criteria

1. THE Organization_Model SHALL include an organization_country field (varchar) that stores the country ISO code
2. THE organization_country field SHALL be a foreign key referencing countries.iso_code
3. THE Organization_Model SHALL default organization_country to "CR" (Costa Rica) when not specified
4. THE Forms SHALL use the organization's organization_country field directly for data API requests
5. WHEN the organization context is not available, THE Forms SHALL default to "CR" (Costa Rica)
6. THE Forms SHALL pass the ISO code to all data API hooks that require it
7. WHEN the organization changes, THE Forms SHALL refetch reference data with the new ISO code
8. THE Forms SHALL handle cases where the organization's organization_country is null or undefined

### Requirement 10: Cache Document Version on Login

**User Story:** As a developer, I want document version data cached on login, so that data API calls requiring version_id can use the cached value without additional requests.

#### Acceptance Criteria

1. WHEN a user logs in, THE Application SHALL fetch the current document version for the organization's country
2. THE Application SHALL store the document version data in React Query cache with key ['document-version', iso_code]
3. THE Application SHALL use staleTime of 1 hour for document version cache
4. WHEN data API endpoints require version_id, THE Application SHALL retrieve it from the cached document version
5. WHEN the organization's country changes, THE Application SHALL refetch and cache the new document version
6. IF document version fetch fails on login, THE Application SHALL log the error but not block login flow

### Requirement 11: Optimize Data Fetching Performance

**User Story:** As a user, I want forms to load quickly and efficiently, so that I can complete my work without delays.

#### Acceptance Criteria

1. THE Forms SHALL fetch only the reference data needed for visible fields
2. THE Forms SHALL use React Query's staleTime configuration to minimize redundant API calls
3. WHEN multiple forms use the same reference data, THE Application SHALL serve cached data from React Query
4. THE Forms SHALL fetch cascading location data only after parent selections are made
5. THE Forms SHALL not block form rendering while reference data loads

