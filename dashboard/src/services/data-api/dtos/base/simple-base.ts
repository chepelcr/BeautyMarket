/**
 * SimpleBase - Level 1 Base Type
 * 
 * The simplest base type for catalog entities.
 * Provides only the essential fields that all entities share.
 * 
 * Fields:
 * - id: Primary key identifier
 * - created_on: Timestamp when the record was created
 * - updated_on: Timestamp when the record was last updated
 * 
 * Used by:
 * - notification-codes (no status, no country_code, no deleted_on)
 * - All location entities (countries, states, counties, districts, neighborhoods)
 */
export interface SimpleBase {
  /**
   * Unique identifier for the entity
   */
  id: number;

  /**
   * Timestamp when the record was created (ISO 8601 format)
   */
  created_on: string;

  /**
   * Timestamp when the record was last updated (ISO 8601 format)
   */
  updated_on: string;
}
