/**
 * Fixed-window in-memory rate limiter.
 *
 * The counter Map lives on `globalThis` (same pattern as the store
 * singleton in src/lib/db/index.ts) so it survives Next.js dev HMR -
 * a plain module-level Map would be re-created on every hot reload.
 * It is still in-memory and per-instance: on serverless platforms
 * (e.g. Vercel) every lambda instance keeps its own independent
 * counters, and all counters reset when the process restarts. This
 * blunts accidental hammering and light abuse; it is not a
 * distributed limiter.
 */

type Bucket = { count: number; resetAt: number };

const globalForRateLimit = globalThis as unknown as {
  __cpLabRateLimitBuckets?: Map<string, Bucket>;
};

const buckets: Map<string, Bucket> =
  globalForRateLimit.__cpLabRateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.__cpLabRateLimitBuckets = buckets;

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the current window resets (>= 1; 0 when ok). */
  retryAfterSec: number;
};

/**
 * Count one hit against `key` in a fixed window of `windowMs`.
 * Returns `{ ok: true }` while the window holds at most `max` hits;
 * once exceeded, returns `{ ok: false, retryAfterSec }` until the
 * window resets.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSec: 0 };
}
