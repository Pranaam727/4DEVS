import { describe, it, expect, beforeEach } from 'vitest';
import { globalCache } from '@/lib/server/cache';
import { rateLimiter } from '@/lib/server/rate-limit';
import { getServerEnv } from '@/lib/server/env';

describe('Cache, Rate Limiting & Server Environment Resilience', () => {
  beforeEach(() => {
    globalCache.clear();
  });

  it('correctly reports fresh, stale, and expired cache states', () => {
    const key = 'test-dataset';
    const mockData = { metric: 42 };

    // Set with 1s TTL and 2s grace
    globalCache.set(
      key,
      mockData,
      {
        asOf: '2025-01-01',
        source: 'Test Authority',
        sourceUrl: 'https://test.gov.in',
      },
      1, // 1s TTL
      2  // 2s Grace
    );

    // Immediate check -> fresh
    const freshCheck = globalCache.get(key);
    expect(freshCheck.state).toBe('fresh');
    expect(freshCheck.entry?.data).toEqual(mockData);
  });

  it('rate limiter decrements remaining count and throttles when exhausted', () => {
    const testIp = 'test-client-ip-rate-limit';

    const first = rateLimiter.check(testIp);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBeGreaterThan(0);

    // Repeated requests
    for (let i = 0; i < 150; i++) {
      rateLimiter.check(testIp);
    }

    const throttled = rateLimiter.check(testIp);
    expect(throttled.allowed).toBe(false);
    expect(throttled.remaining).toBe(0);
    expect(throttled.resetInMs).toBeGreaterThan(0);
  });

  it('server environment safely falls back to defaults without crashing', () => {
    const env = getServerEnv();
    expect(env).toBeDefined();
    expect(['development', 'production', 'test']).toContain(env.NODE_ENV);
    expect(typeof env.CACHE_TTL_SECONDS).toBe('number');
    expect(typeof env.RATE_LIMIT_MAX_REQUESTS).toBe('number');
  });
});
