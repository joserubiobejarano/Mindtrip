import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiter, RATE_LIMITS, type RateLimitType } from './in-memory-limiter';
import { requireAuth } from '@/lib/auth/require-auth';

/**
 * Rate limit configuration for an endpoint
 */
export interface RateLimitConfig {
  type: RateLimitType;
  identifier?: (request: NextRequest, userId: string) => string; // Custom identifier function
}

/**
 * Creates a rate limit middleware wrapper for API routes.
 * Checks both per-minute and per-hour limits.
 * 
 * @param config - Rate limit configuration
 * @returns Middleware function that wraps route handlers
 */
export function withRateLimit(config: RateLimitConfig) {
  return function <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (...args: Parameters<T>) => {
      const request = args[0] as NextRequest;
      
      try {
        // Get user ID for rate limiting
        // If auth fails, we'll let the handler deal with it
        let userId: string | null = null;
        try {
          const authResult = await requireAuth();
          userId = authResult.clerkUserId;
        } catch {
          // Auth will be checked in handler, continue for rate limiting
          // Use IP as fallback identifier
        }

        // Create rate limit key
        const identifier = config.identifier
          ? config.identifier(request, userId || 'anonymous')
          : userId || request.ip || 'unknown';
        
        const key = `${config.type}:${identifier}`;
        const limits = RATE_LIMITS[config.type];
        const limiter = getRateLimiter();

        // Check per-minute limit
        const minuteCheck = limiter.check(`${key}:minute`, limits.perMinute);
        if (!minuteCheck.allowed) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              message: 'Too many requests. Please try again later.',
              retryAfter: Math.ceil((minuteCheck.resetAt - Date.now()) / 1000),
            },
            {
              status: 429,
              headers: {
                'Retry-After': Math.ceil((minuteCheck.resetAt - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': limits.perMinute.maxRequests.toString(),
                'X-RateLimit-Remaining': minuteCheck.remaining.toString(),
                'X-RateLimit-Reset': new Date(minuteCheck.resetAt).toISOString(),
              },
            }
          );
        }

        // Check per-hour limit
        const hourCheck = limiter.check(`${key}:hour`, limits.perHour);
        if (!hourCheck.allowed) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              message: 'Hourly rate limit exceeded. Please try again later.',
              retryAfter: Math.ceil((hourCheck.resetAt - Date.now()) / 1000),
            },
            {
              status: 429,
              headers: {
                'Retry-After': Math.ceil((hourCheck.resetAt - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': limits.perHour.maxRequests.toString(),
                'X-RateLimit-Remaining': hourCheck.remaining.toString(),
                'X-RateLimit-Reset': new Date(hourCheck.resetAt).toISOString(),
              },
            }
          );
        }

        // Add rate limit headers to successful responses
        const response = await handler(...args);
        
        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit-Minute', limits.perMinute.maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining-Minute', minuteCheck.remaining.toString());
        response.headers.set('X-RateLimit-Limit-Hour', limits.perHour.maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining-Hour', hourCheck.remaining.toString());
        
        return response;
      } catch (error) {
        // If rate limiting fails, log but don't block (fail open)
        console.error('Rate limit error:', error);
        return handler(...args);
      }
    }) as T;
  };
}

/**
 * Simple rate limit check without wrapping handler.
 * Useful for inline checks in route handlers.
 * 
 * @param request - Next.js request
 * @param type - Rate limit type
 * @param userId - User ID (optional, will use IP if not provided)
 * @returns Rate limit check result or error response
 */
export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType,
  userId?: string
): Promise<
  | { allowed: true; remainingMinute: number; remainingHour: number }
  | { allowed: false; response: NextResponse }
> {
  const identifier = userId || request.ip || 'unknown';
  const key = `${type}:${identifier}`;
  const limits = RATE_LIMITS[type];
  const limiter = getRateLimiter();

  // Check per-minute limit
  const minuteCheck = limiter.check(`${key}:minute`, limits.perMinute);
  if (!minuteCheck.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((minuteCheck.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((minuteCheck.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': limits.perMinute.maxRequests.toString(),
            'X-RateLimit-Remaining': minuteCheck.remaining.toString(),
          },
        }
      ),
    };
  }

  // Check per-hour limit
  const hourCheck = limiter.check(`${key}:hour`, limits.perHour);
  if (!hourCheck.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Hourly rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((hourCheck.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((hourCheck.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': limits.perHour.maxRequests.toString(),
            'X-RateLimit-Remaining': hourCheck.remaining.toString(),
          },
        }
      ),
    };
  }

  return {
    allowed: true,
    remainingMinute: minuteCheck.remaining,
    remainingHour: hourCheck.remaining,
  };
}
