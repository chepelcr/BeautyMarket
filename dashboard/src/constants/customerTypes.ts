/**
 * Customer Type Constants
 * These IDs match the customer-types API response
 */
export const CUSTOMER_TYPES = {
  PERSONA: 3,  // Individual/Person
  EMPRESA: 4,  // Company/Business
} as const;

/**
 * Identification Code Constants
 * These codes match the identifications API response
 */
export const IDENTIFICATION_CODES = {
  CEDULA_FISICA: '01',      // Physical ID (Costa Rica - Persona)
  CEDULA_JURIDICA: '02',    // Legal Entity ID (Costa Rica - Empresa)
  DIMEX: '03',              // Foreign ID (Costa Rica - Persona)
  NITE: '04',               // Tax ID for foreigners (Costa Rica - Both)
  PASAPORTE: '05',          // Passport (Foreign - Both)
} as const;

/**
 * Country ISO Codes
 */
export const COUNTRY_CODES = {
  COSTA_RICA: '188',
} as const;
