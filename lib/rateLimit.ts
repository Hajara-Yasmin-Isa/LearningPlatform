const requests = new Map<string, { count: number; resetAt: number }>()

/**
 * Simple in-process rate limiter. Good enough for single-instance beta.
 * For multi-instance production, replace with Upstash Redis.
 *
 * @param key    Unique identifier (e.g. IP address or user ID)
 * @param limit  Max requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 * @returns true if the request is allowed, false if rate-limited
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = requests.get(key)

  if (!entry || now > entry.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
