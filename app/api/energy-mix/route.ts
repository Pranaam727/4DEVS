/**
 * GET /api/energy-mix
 * 
 * Central Electricity Authority (CEA) verified data integration.
 * Provides:
 * - Installed capacity (MW & GW) for renewables, large hydro, thermal (coal, gas, lignite, diesel), and nuclear
 * - Actual electricity generation (MU & BU / TWh)
 * - Energy mix percentages
 * - Coal vs. Renewable comparative metrics
 * - Historical capacity additions (FY 2021-22 through FY 2024-25)
 * - Regional capacity breakdown
 * 
 * Strict separation of capacity (MW/GW) and generation (MU/BU).
 */

import { NextRequest } from 'next/server';
import { getEnergyMixData } from '@/lib/sources/cea-energy';
import { createSuccessResponse, createUnavailableResponse } from '@/lib/server/response';
import { rateLimiter } from '@/lib/server/rate-limit';
import { globalCache } from '@/lib/server/cache';
import { EnergyMixData } from '@/lib/types/energy-mix';


export async function GET(request: NextRequest) {
  // Rate limit by IP or fallback
  const ip = request.headers.get('x-forwarded-for') || 'local-client';
  const { allowed, remaining, resetInMs } = rateLimiter.check(ip);
  if (!allowed) {
    return createUnavailableResponse(
      `Rate limit exceeded. Try again in ${Math.ceil(resetInMs / 1000)}s.`,
      new Date().toISOString(),
      429,
      { 'Retry-After': String(Math.ceil(resetInMs / 1000)) }
    );
  }

  const cacheKey = 'api:energy-mix';
  const cached = globalCache.get<EnergyMixData>(cacheKey);

  if (cached.state === 'fresh' && cached.entry) {
    return createSuccessResponse(cached.entry.data, {
      asOf: cached.entry.asOf,
      retrievedAt: cached.entry.retrievedAt,
      source: cached.entry.source,
      sourceUrl: cached.entry.sourceUrl,
    }, {
      'X-Data-Freshness': 'fresh',
      'X-Data-Age': String(cached.ageSeconds),
      'X-RateLimit-Remaining': String(remaining),
    });
  }

  try {
    const result = await getEnergyMixData();

    globalCache.set(
      cacheKey,
      result.data,
      {
        asOf: result.asOf,
        retrievedAt: result.retrievedAt,
        source: result.source,
        sourceUrl: result.sourceUrl,
      },
      3600 // 1 hour TTL
    );

    return createSuccessResponse(result.data, {
      asOf: result.asOf,
      retrievedAt: result.retrievedAt,
      source: result.source,
      sourceUrl: result.sourceUrl,
    }, {
      'X-Data-Freshness': 'fresh',
      'X-Data-Age': '0',
      'X-RateLimit-Remaining': String(remaining),
    });
  } catch (err: any) {
    console.error('[GET /api/energy-mix] Failed to retrieve energy mix:', err);

    // Stale fallback policy
    if (cached.state === 'stale' && cached.entry) {
      return createSuccessResponse(cached.entry.data, {
        asOf: cached.entry.asOf,
        retrievedAt: cached.entry.retrievedAt,
        source: cached.entry.source,
        sourceUrl: cached.entry.sourceUrl,
      }, {
        'X-Data-Freshness': 'stale',
        'X-Data-Age': String(cached.ageSeconds),
        'X-RateLimit-Remaining': String(remaining),
      });
    }

    return createUnavailableResponse(
      'CEA energy mix telemetry is temporarily unavailable. Upstream data portal could not be reached.',
      new Date().toISOString(),
      503
    );
  }
}
