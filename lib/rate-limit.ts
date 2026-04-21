import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute window

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "anonymous";
}

function makeKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

export type RateLimitResult =
  | { success: true; limit: number; remaining: number; reset: number }
  | { success: false; limit: number; remaining: number; reset: number; retryAfter: number };

function checkMemoryRateLimit(
  request: Request,
  options: { prefix: string; maxRequests: number; windowMs?: number }
): RateLimitResult {
  const { prefix, maxRequests, windowMs = WINDOW_MS } = options;
  const identifier = getClientIP(request);
  const key = makeKey(identifier, prefix);
  const now = Date.now();

  const existing = store.get(key);

  if (!existing || existing.resetTime < now) {
    // New window
    const resetTime = now + windowMs;
    store.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: resetTime
    };
  }

  if (existing.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: existing.resetTime,
      retryAfter: Math.ceil((existing.resetTime - now) / 1000)
    };
  }

  existing.count++;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - existing.count,
    reset: existing.resetTime
  };
}

export async function checkRateLimit(
  request: Request,
  options: { prefix: string; maxRequests: number; windowMs?: number }
): Promise<RateLimitResult> {
  const { prefix, maxRequests, windowMs = WINDOW_MS } = options;
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return checkMemoryRateLimit(request, options);
  }

  const identifier = getClientIP(request);
  const key = makeKey(identifier, prefix);

  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      bucket_key: key,
      max_requests: maxRequests,
      window_ms: windowMs
    });

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return checkMemoryRateLimit(request, options);
    }

    return row.success
      ? {
          success: true,
          limit: row.limit,
          remaining: row.remaining,
          reset: row.reset
        }
      : {
          success: false,
          limit: row.limit,
          remaining: row.remaining,
          reset: row.reset,
          retryAfter: row.retry_after
        };
  } catch {
    return checkMemoryRateLimit(request, options);
  }
}

export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(result.reset));
  if (!result.success) {
    headers.set("Retry-After", String(result.retryAfter));
  }
}
