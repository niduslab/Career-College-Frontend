"use client";

import { useEffect } from "react";

/** Locks page scroll while `locked` is true — for modals/overlays that shouldn't let the background scroll behind them. */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);
}
