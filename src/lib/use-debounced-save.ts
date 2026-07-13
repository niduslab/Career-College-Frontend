import { useRef } from "react";

/**
 * Debounce a keyed save operation — e.g. one timer per question/answer/field
 * being auto-saved as the user types, so a save only fires after they pause.
 */
export function useDebouncedSave() {
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  return (key: string, fn: () => void, delayMs = 500) => {
    const existing = timers.current.get(key);
    if (existing) clearTimeout(existing);
    timers.current.set(
      key,
      setTimeout(() => {
        timers.current.delete(key);
        fn();
      }, delayMs),
    );
  };
}
