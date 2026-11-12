/**
 * GET /api/energy-mix
 *
 * PLACEHOLDER STUB — owned by Member 2 (Backend Engineer)
 *
 * This file establishes the route and response contract.
 * Member 2 must implement the actual data ingestion from CEA/MNRE sources.
 *
 * IMPORTANT: Do NOT return fake/fabricated data here. If the backend is not yet integrated,
 * return an `unavailable` status so the frontend can display an honest state.
 *
 * Response Contract: See lib/types/energy-mix.ts → EnergyMixResponse
 *
 * HTTP Codes:
 *   200 — Successful data retrieval (status: "success" | "unavailable")
 *   500 — Unexpected server error (status: "error")
 */
import { NextResponse } from 'next/server';
import type { EnergyMixResponse } from '@/lib/types/energy-mix';

export async function GET(): Promise<NextResponse<EnergyMixResponse>> {
  const retrievedAt = new Date().toISOString();

  // -------------------------------------------------------------------------
  // TODO (Member 2): Replace this stub with real data fetching from:
  //   - CEA Monthly Reports (cea.nic.in)
  //   - MNRE press releases
  //   - Grid-India / POSOCO daily reports
  //
  // The response MUST follow EnergyMixResponse type from lib/types/energy-mix.ts
  // The response MUST set asOf to the official publication date.
  // The response MUST NOT contain fabricated or placeholder numbers.
  // -------------------------------------------------------------------------

  const unavailableResponse: EnergyMixResponse = {
    status: 'unavailable',
    asOf: null,
    retrievedAt,
    source: null,
    sourceUrl: null,
    message:
      'Energy mix data ingestion pipeline is not yet connected to official CEA/MNRE sources. This will be implemented by Member 2 (Backend Engineer). No synthetic data will be substituted.',
    data: null,
  };

  return NextResponse.json(unavailableResponse, { status: 200 });
}
