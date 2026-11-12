/**
 * INDIA GREEN GRID — DATA FRESHNESS & CACHE MANAGER
 * 
 * Implements strict data freshness policy:
 * 1. Fresh: Cached within TTL.
 * 2. Stale: Beyond TTL but within grace period. Served ONLY when upstream fails/outage,
 *    and ALWAYS marked with freshness headers and explicit staleness indicator.
 * 3. Expired: Beyond grace period. Upstream must succeed, otherwise return honest unavailable.
 * 
 * Never substitutes fabricated data silently.
 */

import { getServerEnv } from './env';

export interface CacheEntry<T> {
  data: T;
  asOf: string;
  retrievedAt: string;
  source: string;
  sourceUrl: string;
  cachedAt: number; // unix timestamp ms
  ttlMs: number;
  graceMs: number;
}

export type FreshnessState = 'fresh' | 'stale' | 'expired' | 'miss';

export interface CacheLookupResult<T> {
  state: FreshnessState;
  entry: CacheEntry<T> | null;
  ageSeconds: number;
}

class MemoryCacheManager {
  private store: Map<string, CacheEntry<unknown>> = new Map();

  get<T>(key: string): CacheLookupResult<T> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return { state: 'miss', entry: null, ageSeconds: 0 };
    }

    const now = Date.now();
    const ageMs = now - entry.cachedAt;
    const ageSeconds = Math.floor(ageMs / 1000);

    if (ageMs <= entry.ttlMs) {
      return { state: 'fresh', entry, ageSeconds };
    }

    if (ageMs <= entry.ttlMs + entry.graceMs) {
      return { state: 'stale', entry, ageSeconds };
    }

    return { state: 'expired', entry, ageSeconds };
  }

  set<T>(
    key: string,
    data: T,
    meta: { asOf: string; retrievedAt?: string; source: string; sourceUrl: string },
    customTtlSeconds?: number,
    customGraceSeconds?: number
  ): CacheEntry<T> {
    const env = getServerEnv();
    const ttlSeconds = customTtlSeconds ?? env.CACHE_TTL_SECONDS;
    const graceSeconds = customGraceSeconds ?? env.STALE_GRACE_PERIOD_SECONDS;

    const entry: CacheEntry<T> = {
      data,
      asOf: meta.asOf,
      retrievedAt: meta.retrievedAt || new Date().toISOString(),
      source: meta.source,
      sourceUrl: meta.sourceUrl,
      cachedAt: Date.now(),
      ttlMs: ttlSeconds * 1000,
      graceMs: graceSeconds * 1000,
    };

    this.store.set(key, entry as CacheEntry<unknown>);
    return entry;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const globalCache = new MemoryCacheManager();
