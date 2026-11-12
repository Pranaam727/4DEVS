/**
 * INDIA GREEN GRID — STANDARDIZED API RESPONSE BUILDERS
 * 
 * Enforces the strict envelope format agreed upon across team members:
 * 
 * Success:
 * {
 *   "status": "success",
 *   "asOf": "actual publication date",
 *   "retrievedAt": "actual retrieval timestamp",
 *   "source": "actual source name",
 *   "sourceUrl": "actual source URL",
 *   "data": {}
 * }
 * 
 * Unavailable:
 * {
 *   "status": "unavailable",
 *   "asOf": null,
 *   "retrievedAt": "actual retrieval timestamp if available",
 *   "source": null,
 *   "sourceUrl": null,
 *   "message": "Reason for unavailability",
 *   "data": null
 * }
 */

import { NextResponse } from 'next/server';
import { ApiSuccessResponse, ApiUnavailableResponse } from '@/lib/types/api';

export interface SuccessResponseMeta {
  asOf: string;
  retrievedAt?: string;
  source: string;
  sourceUrl: string;
}

export function createSuccessResponse<T>(
  data: T,
  meta: SuccessResponseMeta,
  headers?: HeadersInit
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = {
    status: 'success',
    asOf: meta.asOf,
    retrievedAt: meta.retrievedAt || new Date().toISOString(),
    source: meta.source,
    sourceUrl: meta.sourceUrl,
    data,
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      ...headers,
    },
  });
}

export function createUnavailableResponse(
  message: string,
  retrievedAt?: string | null,
  statusCode: number = 200, // Return 200 with honest unavailable status envelope as specified
  headers?: HeadersInit
): NextResponse<ApiUnavailableResponse> {
  const body: ApiUnavailableResponse = {
    status: 'unavailable',
    asOf: null,
    retrievedAt: retrievedAt !== undefined ? retrievedAt : new Date().toISOString(),
    source: null,
    sourceUrl: null,
    message,
    data: null,
  };

  return NextResponse.json(body, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      ...headers,
    },
  });
}
