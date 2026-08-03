/**
 * Session cache for GitHub API responses.
 *
 * Extracted from App.jsx so the validation can be tested directly. The entry format is
 * `{ data, timestamp }`, and `readCacheEntry` is deliberately strict about it: an entry
 * that parses but isn't that shape is rejected rather than partially trusted.
 *
 * That strictness is the point. The previous inline version checked only that JSON.parse
 * succeeded, then did `Date.now() - parsed.timestamp > CACHE_TTL_MS`. For an entry with no
 * timestamp that comparison is `NaN > TTL`, which is `false` — so the entry read as *fresh*
 * and `parsed.data` came back `undefined`. The caller received undefined where it expected
 * a profile and no error was raised anywhere.
 */

export interface CacheEnvelope<T = unknown> {
  data: T;
  timestamp: number;
}

/** Fifteen minutes. Short enough to stay current, long enough to matter against
 *  GitHub's 60-requests-per-hour unauthenticated limit. */
export const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * True when `value` is the envelope this module writes.
 *
 * `data` may legitimately be null (a valid JSON body), so the check is `!== undefined`
 * rather than a truthiness test — otherwise a cached `null` response would be discarded
 * and refetched every time.
 */
export function isCacheEnvelope(value: unknown): value is CacheEnvelope {
  if (value === null || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.timestamp === "number" &&
    Number.isFinite(candidate.timestamp) &&
    candidate.data !== undefined
  );
}

/** True when an envelope is older than the TTL. */
export function isExpired(entry: CacheEnvelope, now: number = Date.now()): boolean {
  return now - entry.timestamp > CACHE_TTL_MS;
}

/**
 * Read a cache entry, returning `undefined` when there is nothing usable.
 *
 * `undefined` means "fetch it"; it is never a cached value, because an envelope with
 * `data: undefined` fails `isCacheEnvelope`.
 */
export function readCacheEntry<T = unknown>(
  raw: string | null,
  now: number = Date.now(),
): T | undefined {
  if (!raw) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }

  if (!isCacheEnvelope(parsed)) return undefined;
  if (isExpired(parsed, now)) return undefined;

  return parsed.data as T;
}
