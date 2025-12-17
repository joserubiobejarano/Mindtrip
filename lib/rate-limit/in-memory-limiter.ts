/**
 * Simple in-memory rate limiter.
 * Suitable for single-instance deployments.
 * For multi-instance deployments, consider upgrading to Redis-based limiter.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request should be allowed based on rate limit.
   * 
   * @param key - Unique identifier for the rate limit (e.g., userId:endpoint)
   * @param config - Rate limit configuration
   * @returns Object with allowed flag and remaining requests
   */
  check(
    key: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetAt) {
      // Create new entry or reset expired entry
      const resetAt = now + config.windowMs;
      this.store.set(key, {
        count: 1,
        resetAt,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt,
      };
    }

    // Entry exists and is still valid
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all entries (useful for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cleanup interval on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Singleton instance
let limiterInstance: InMemoryRateLimiter | null = null;

export function getRateLimiter(): InMemoryRateLimiter {
  if (!limiterInstance) {
    limiterInstance = new InMemoryRateLimiter();
  }
  return limiterInstance;
}

// Rate limit configurations
export const RATE_LIMITS = {
  // AI endpoints: 10/min, 100/hour
  AI: {
    perMinute: { maxRequests: 10, windowMs: 60 * 1000 },
    perHour: { maxRequests: 100, windowMs: 60 * 60 * 1000 },
  },
  // Places endpoints: 30/min, 500/hour
  PLACES: {
    perMinute: { maxRequests: 30, windowMs: 60 * 1000 },
    perHour: { maxRequests: 500, windowMs: 60 * 60 * 1000 },
  },
  // Assistant/chat: 20/min, 200/hour
  ASSISTANT: {
    perMinute: { maxRequests: 20, windowMs: 60 * 1000 },
    perHour: { maxRequests: 200, windowMs: 60 * 60 * 1000 },
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;
