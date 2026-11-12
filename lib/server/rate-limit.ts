/**
 * INDIA GREEN GRID — RATE LIMITER
 * 
 * Token bucket / sliding window limiter for backend endpoints.
 * Prevents denial of service and protects against downstream/upstream quota exhaustion.
 */

import { getServerEnv } from './env';

interface ClientWindow {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private windows: Map<string, ClientWindow> = new Map();

  check(identifier: string): { allowed: boolean; remaining: number; resetInMs: number } {
    const env = getServerEnv();
    const limit = env.RATE_LIMIT_MAX_REQUESTS;
    const windowMs = env.RATE_LIMIT_WINDOW_MS;
    const now = Date.now();

    const client = this.windows.get(identifier);

    if (!client || now > client.resetTime) {
      this.windows.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
    }

    if (client.count < limit) {
      client.count += 1;
      return {
        allowed: true,
        remaining: limit - client.count,
        resetInMs: Math.max(0, client.resetTime - now),
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, client.resetTime - now),
    };
  }

  // Periodic cleanup of stale entries
  cleanup(): void {
    const now = Date.now();
    this.windows.forEach((value, key) => {
      if (now > value.resetTime) {
        this.windows.delete(key);
      }
    });
  }
}

export const rateLimiter = new RateLimiter();
