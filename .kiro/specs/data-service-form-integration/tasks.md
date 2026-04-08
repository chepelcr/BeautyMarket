# Implementation Plan: Data Service Form Integration

## Overview

This implementation plan integrates the existing data API service with CustomerForm and ProductForm components to replace hardcoded reference data with dynamic data from the centralized data API. The approach follows a progressive integration pattern: start with CustomerForm (establishes patterns for customer data), then move to ProductForm sections (CodesSection, DiscountsSection, AdvancedTaxesSection), and finish with integration testing.

Each task builds incrementally on previous work, with property-based tests placed close to implementation to catch errors early. The implementation leverages existing useDataApi hooks for React Query caching and state management.

## Tasks

- [x] 1. Integrate Data API with CustomerForm - Document Types and Countries
  - [x] 1.1 Add ISO code resolution logic to CustomerForm
    - Get ISO code from organization's organization_country field
    - Default to "CR" if organization context unavailable
    - Create useMemo hook for ISO code calculation
    - _Requirements: 9.1, 9.2_
  
  - [x] 1.2 Replace hardcoded document types with useAllDocumentTypes hook
    - Import and call useAllDocumentTypes hook with ISO code
    - Transform API response to populate identification type dropdown
    - Handle loading state with disabled field and loading indicator
    - Handle error state with error message and retry button
    - _Requirements: 1.1, 1.8, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 1.3 Replace hardcoded countries with useAllCountries hook
    - Import and call useAllCountries hook
    - Transform API response to populate nationality dropdown
    - Handle loading and error states
    - _Requirements: 1.2, 1.9_
  
  - [x] 1.4 Implement phone code auto-population from country selection
    - Watch nationality field for changes
    - Extract phone_code from selected country data
    - Auto-populate phone country code field
    - Remove hardcoded phone code values
    - _Requirements: 1.3, 1.10_
  
  - [ ]* 1.5 Write property test for country selection populates phone code
    - **Property 1: Country Selection Populates Phone Code**
    - **Validates: Requirements 1.3**

- [x] 2. Implement Cascading Location Selectors in CustomerForm
  - [x] 2.1 Add state management for location hierarchy
    - Add form.watch calls for country, state, county, district selections
    - Create useEffect hooks to clear child fields when parent changes
    - Implement field disabling logic based on parent selection
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 2.2 Integrate useStates hook with conditional fetching
    - Call useStates hook with ISO code
    - Enable hook only when country is selected
    - Transform API response for state dropdown
    - Handle loading and error states
    - _Requirements: 1.4, 10.1_
  
  - [x] 2.3 Integrate useCounties hook with conditional fetching
    - Call useCounties hook with ISO code and state_id
    - Enable hook only when state is selected
    - Transform API response for county dropdown
    - Handle loading and error states
    - _Requirements: 1.5, 10.1_
  
  - [x] 2.4 Integrate useDistricts hook with conditional fetching
    - Call useDistricts hook with ISO code, state_id, and county_id
    - Enable hook only when county is selected
    - Transform API response for district dropdown
    - Handle loading and error states
    - _Requirements: 1.6, 10.1_
  
  - [x] 2.5 Integrate useNeighborhoods hook with conditional fetching
    - Call useNeighborhoods hook with ISO code, state_id, county_id, and district_id
    - Enable hook only when district is selected
    - Transform API response for neighborhood dropdown
    - Handle loading and error states
    - Remove hardcoded location ID values
    - _Requirements: 1.7, 1.11, 10.1_
  
  - [ ]* 2.6 Write property test for cascading location data fetching
    - **Property 2: Cascading Location Data Fetching**
    - **Validates: Requirements 1.5, 1.6, 1.7, 10.4**
  
  - [ ]* 2.7 Write property test for cascading field clearing
    - **Property 3: Cascading Field Clearing**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  
  - [ ]* 2.8 Write property test for child selectors disabled without parent
    - **Property 4: Child Selectors Disabled Without Parent**
    - **Validates: Requirements 5.5**
  
  - [ ]* 2.9 Write property test for selector enabling after data load
    - **Property 5: Selector Enabling After Data Load**
    - **Validates: Requirements 5.7**

- [x] 3. Add Loading and Error State Handling to CustomerForm
  - [x] 3.1 Implement loading state indicators for all reference data fields
    - Add loading spinners to dropdowns while data fetches
    - Disable fields during loading
    - Display loading text in select placeholders
    - _Requirements: 5.6, 6.1, 6.2_
  
  - [x] 3.2 Implement comprehensive error handling for all data API calls
    - Display error messages near affected fields
    - Add retry buttons for failed requests
    - Clear error messages when retry is initiated
    - Ensure unaffected fields remain interactive during errors
    - _Requirements: 6.3, 6.4, 6.5, 6.6_
  
  - [x] 3.3 Add form submission validation for reference data
    - Validate all required reference data fields are populated
    - Prevent submission while reference data is loading
    - Prevent submission if critical reference data failed to load
    - Display validation errors for missing required selections
    - Ensure form uses ID values from selected reference data
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 3.4 Write property test for loading state handling
    - **Property 6: Loading State Handling**
    - **Validates: Requirements 5.6, 6.1, 6.2**
  
  - [ ]* 3.5 Write property test for error state handling
    - **Property 7: Error State Handling**
    - **Validates: Requirements 6.3, 6.4, 6.5**
  
  - [ ]* 3.6 Write property test for unaffected fields remain interactive
    - **Property 8: Unaffected Fields Remain Interactive**
    - **Validates: Requirements 6.6**
  
  - [ ]* 3.7 Write property test for form submission validation
    - **Property 11: Form Submission Validation**
    - **Validates: Requirements 8.1, 8.2**
  
  - [ ]* 3.8 Write property test for submission blocked during loading
    - **Property 12: Submission Blocked During Loading**
    - **Validates: Requirements 8.4**
  
  - [ ]* 3.9 Write property test for submission blocked on error
    - **Property 13: Submission Blocked On Error**
    - **Validates: Requirements 8.5**
  
  - [ ]* 3.10 Write property test for validation error display
    - **Property 14: Validation Error Display**
    - **Validates: Requirements 8.6**

- [x] 4. Checkpoint - Ensure CustomerForm integration is complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrate Data API with ProductForm CodesSection
  - [x] 5.1 Add ISO code resolution to CodesSection
    - Determine ISO code from organization context
    - Pass ISO code to data API hooks
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 5.2 Replace hardcoded CODE_TYPES with useAllCodes hook
    - Import and call useAllCodes hook with ISO code
    - Transform API response to match existing CODE_TYPES structure
    - Map code type's code and description fields to dropdown options
    - Remove hardcoded CODE_TYPES array
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 5.3 Implement loading and error handling for code types
    - Display loading indicator while code types fetch
    - Disable code selection during loading
    - Display error message if API request fails
    - Add retry button for failed requests
    - _Requirements: 2.5, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 5.4 Verify existing UI behavior is maintained
    - Test adding codes with dynamic code types
    - Test removing codes
    - Test displaying codes
    - Ensure no regression in existing functionality
    - _Requirements: 2.4_
  
  - [ ]* 5.5 Write property test for code type display fields
    - **Property 9: Code Type Display Fields**
    - **Validates: Requirements 2.3**

- [x] 6. Integrate Data API with ProductForm DiscountsSection
  - [x] 6.1 Add ISO code resolution to DiscountsSection
    - Determine ISO code from organization context
    - Pass ISO code to data API hooks
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 6.2 Replace hardcoded DISCOUNT_TYPES with useAllDiscountTypes hook
    - Import and call useAllDiscountTypes hook with ISO code
    - Transform API response to match existing DISCOUNT_TYPES structure
    - Map discount type's code and description fields to dropdown options
    - Remove hardcoded DISCOUNT_TYPES array
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 6.3 Preserve special handling for discount type code "99"
    - Maintain isOtherDiscountType helper function
    - Ensure "Otro/Other" discount type shows reason field
    - Test that code "99" logic works with dynamic data
    - _Requirements: 3.5_
  
  - [x] 6.4 Implement loading and error handling for discount types
    - Display loading indicator while discount types fetch
    - Disable discount selection during loading
    - Display error message if API request fails
    - Add retry button for failed requests
    - _Requirements: 3.6, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 6.5 Verify existing UI behavior is maintained
    - Test adding discounts with dynamic discount types
    - Test removing discounts
    - Test calculating discounts
    - Ensure no regression in existing functionality
    - _Requirements: 3.4_
  
  - [ ]* 6.6 Write property test for discount type display fields
    - **Property 10: Discount Type Display Fields**
    - **Validates: Requirements 3.3**

- [x] 7. Integrate Data API with ProductForm AdvancedTaxesSection
  - [x] 7.1 Add ISO code resolution to AdvancedTaxesSection
    - Determine ISO code from organization context
    - Pass ISO code to data API hooks
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 7.2 Replace organization-specific tax types API with useAllTaxes hook
    - Import and call useAllTaxes hook with ISO code
    - Transform API response to match existing tax types structure
    - Maintain compatibility with existing tax calculation logic
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [x] 7.3 Replace organization-specific tax rates API with useAllTaxRates hook
    - Import and call useAllTaxRates hook with ISO code
    - Transform API response to match existing tax rates structure
    - Maintain compatibility with existing tax calculation logic
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 7.4 Implement fallback to organization-specific API on data API failure
    - Keep existing organization-specific API calls as fallback
    - Enable fallback queries only when data API fails
    - Use data API data if available, otherwise use org API data
    - _Requirements: 4.6_
  
  - [x] 7.5 Verify special tax type handling is preserved
    - Test IVA (01) tax type logic
    - Test IVACE (07) tax type logic
    - Test IVARBU (08) tax type logic
    - Test IUC (03), ISEBA (04), IPT (06), ISEBEC (05) tax types
    - Ensure all special tax calculations remain unchanged
    - _Requirements: 4.5_

- [x] 8. Checkpoint - Ensure ProductForm sections integration is complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Organization Context Change Handling
  - [x] 9.1 Add organization context change detection to CustomerForm
    - Watch for organization context changes
    - Trigger refetch of all reference data when organization changes
    - Update ISO code when organization changes
    - _Requirements: 9.4, 9.5_
  
  - [x] 9.2 Add organization context change detection to ProductForm sections
    - Watch for organization context changes in CodesSection
    - Watch for organization context changes in DiscountsSection
    - Watch for organization context changes in AdvancedTaxesSection
    - Trigger refetch of reference data when organization changes
    - _Requirements: 9.4, 9.5_
  
  - [ ]* 9.3 Write property test for ISO code determination
    - **Property 15: ISO Code Determination**
    - **Validates: Requirements 9.1, 9.2**
  
  - [ ]* 9.4 Write property test for ISO code propagation
    - **Property 16: ISO Code Propagation**
    - **Validates: Requirements 9.3**
  
  - [ ]* 9.5 Write property test for data refetch on organization change
    - **Property 17: Data Refetch On Organization Change**
    - **Validates: Requirements 9.4**

- [x] 10. Optimize Performance and Caching
  - [x] 10.1 Configure React Query staleTime for reference data
    - Set appropriate staleTime for document types (e.g., 5 minutes)
    - Set appropriate staleTime for countries (e.g., 1 hour)
    - Set appropriate staleTime for location data (e.g., 10 minutes)
    - Set appropriate staleTime for codes, discounts, taxes (e.g., 5 minutes)
    - _Requirements: 10.2, 10.3_
  
  - [x] 10.2 Verify conditional data fetching is working correctly
    - Confirm location hooks only fetch when parent is selected
    - Confirm no unnecessary API calls are made
    - Test that React Query deduplicates concurrent requests
    - _Requirements: 10.1_
  
  - [x] 10.3 Verify non-blocking form rendering
    - Confirm forms render immediately without waiting for data
    - Confirm loading states don't block form structure display
    - Test that users can interact with non-dependent fields during loading
    - _Requirements: 10.5_
  
  - [ ]* 10.4 Write property test for conditional data fetching
    - **Property 18: Conditional Data Fetching**
    - **Validates: Requirements 10.1**
  
  - [ ]* 10.5 Write property test for non-blocking form rendering
    - **Property 19: Non-Blocking Form Rendering**
    - **Validates: Requirements 10.5**

- [x] 11. Final Integration Testing and Verification
  - [ ]* 11.1 Write integration tests for CustomerForm complete flow
    - Test full user journey from form load to submission
    - Test cascading location selection flow
    - Test error recovery and retry mechanisms
    - _Requirements: All CustomerForm requirements_
  
  - [ ]* 11.2 Write integration tests for ProductForm sections
    - Test CodesSection with dynamic code types
    - Test DiscountsSection with dynamic discount types including code "99"
    - Test AdvancedTaxesSection with dynamic taxes and fallback behavior
    - _Requirements: All ProductForm requirements_
  
  - [ ]* 11.3 Write integration tests for organization context changes
    - Test ISO code changes trigger data refetch
    - Test forms handle organization context unavailability
    - Test multiple forms share cached data correctly
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.3_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests (not listed) should be written alongside implementation for specific examples and edge cases
- The implementation maintains the existing useDataApi hook abstraction layer for consistent caching and error handling
- All forms use React Query's automatic caching to minimize redundant API calls
- The cascading location selector pattern established in CustomerForm can be reused in other forms if needed
