/**
 * Safe access to localStorage.
 *
 * The app keeps its workspace in localStorage. Reading it with a bare
 * `JSON.parse(localStorage.getItem(key))` throws when the stored value is
 * corrupt -- a truncated write, a value written by an older version of the
 * app, or a user editing it by hand. Because most of these reads happen in
 * a `useState` lazy initialiser, the throw happens during render and takes
 * the whole React tree down, leaving a blank screen with no way back.
 *
 * These helpers treat unreadable data as absent: the caller falls back to
 * its defaults and the bad value is replaced, so the app keeps working
 * instead of failing closed.
 */

/**
 * Read and parse a JSON value from localStorage.
 * Returns `fallback` when the key is missing, the value is corrupt, or
 * localStorage is unavailable (private mode, disabled cookies, quota).
 */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : (parsed as T);
  } catch {
    // Corrupt value -- drop it so the next write starts from a clean state.
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* localStorage unavailable; nothing more we can do */
    }
    return fallback;
  }
}

/**
 * Read a JSON array from localStorage, falling back when the value is
 * corrupt or is not an array.
 */
export function readJsonArray<T>(key: string, fallback: T[]): T[] {
  const parsed = readJson<unknown>(key, fallback);
  return Array.isArray(parsed) ? (parsed as T[]) : fallback;
}

/**
 * Write a JSON value to localStorage.
 * Returns false if the write failed (quota exceeded, storage disabled)
 * instead of throwing.
 */
export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
