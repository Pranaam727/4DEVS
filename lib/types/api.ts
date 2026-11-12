/**
 * INDIA GREEN GRID — SHARED API RESPONSE CONTRACT
 * Agreed contract between Member 1 (Frontend), Member 2 (Backend), and Member 3 (Decision Tools).
 */

export type ApiResponseStatus = 'success' | 'unavailable' | 'error';

export interface BaseApiResponse<T> {
  status: ApiResponseStatus;
  asOf: string | null;
  retrievedAt: string | null;
  source: string | null;
  sourceUrl: string | null;
  message?: string;
  data: T | null;
}

export interface ApiSuccessResponse<T> {
  status: 'success';
  asOf: string;
  retrievedAt: string;
  source: string;
  sourceUrl: string;
  data: T;
}

export interface ApiUnavailableResponse {
  status: 'unavailable';
  asOf: null;
  retrievedAt: string | null;
  source: null;
  sourceUrl: null;
  message: string;
  data: null;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiUnavailableResponse | BaseApiResponse<T>;

export interface SourceProvenance {
  sourceName: string;
  sourceUrl: string;
  publicationDate: string;
  retrievalTimestamp: string;
  verificationStatus: 'verified' | 'provisional' | 'regulatory_order';
  notes?: string;
}
