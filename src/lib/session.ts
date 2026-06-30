/**
 * Client-side auth state for cookie-based auth.

 */

const LOGGED_IN_KEY = "cc_logged_in";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/** Subscribe to auth changes (login/logout). Returns an unsubscribe fn. */
export function onAuthChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Mark the user logged in/out locally and notify subscribers. */
export function setLoggedIn(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(LOGGED_IN_KEY, "1");
  } else {
    localStorage.removeItem(LOGGED_IN_KEY);
  }
  notify();
}

/**
 * Best-effort local read of the logged-in flag. This is a UI hint only — the
 * cookie (and therefore the actual session) may have expired server-side.
 * Verify with `fetchMe()` when correctness matters.
 */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOGGED_IN_KEY) === "1";
}
