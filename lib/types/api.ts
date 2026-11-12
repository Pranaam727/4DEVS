/**
 * Shared API Response Types for India Green Grid
 * Coordinated between Member 1 (Frontend), Member 2 (Backend), and Member 3 (Decision Tools)
 */

export type ApiResponseStatus = 'success' | 'unavailable' | 'error';

export interface BaseApiResponse<T> {
  status: ApiResponseStatus;
  asOf: string | null;            // Official publication date / reporting period (e.g. "2024-10-31" or "October 2024")
  retrievedAt: string | null;     // ISO timestamp when backend retrieved or parsed the data
  source: string | null;          // Official source name (e.g. "Central Electricity Authority (CEA)")
  sourceUrl: string | null;       // Official publication URL or portal reference
  message?: string;               // Explanation for unavailable or error status
  data: T | null;
}
