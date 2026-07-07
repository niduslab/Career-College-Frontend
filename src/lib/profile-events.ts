const listeners = new Set<() => void>();

/** Subscribe to profile updates (photo, logo, name). Returns an unsubscribe fn. */
export function onProfileUpdated(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Notify subscribers that the current user's profile has changed. */
export function notifyProfileUpdated(): void {
  listeners.forEach((fn) => fn());
}
