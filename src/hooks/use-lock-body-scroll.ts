import { useEffect } from "react";

/** Locks page scroll while mounted — use for the lifetime of an open modal/drawer. */
export function useLockBodyScroll(): void {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);
}
