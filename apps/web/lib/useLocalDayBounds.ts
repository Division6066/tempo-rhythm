"use client";

import { useEffect, useState } from "react";
import { getLocalDayBoundsMs, nextLocalDayRolloverDelayMs } from "./todayBounds";

/**
 * Reactive version of {@link getLocalDayBoundsMs}.
 *
 * Returns the current local-day bounds and refreshes them automatically when:
 *  - the local day rolls over while the page is open (single `setTimeout`
 *    scheduled for `endMs - Date.now()`, then re-armed)
 *  - the tab returns from background (`visibilitychange` → `visible`) so a
 *    laptop reopened the next morning catches up immediately
 *  - the window regains focus (covers desktop window-manager edge cases)
 *
 * Avoids polling: at most one timer per tab and only a recompute when the
 * date actually changed. Quick-add and Add-to-Today reads of `bounds.endMs - 1`
 * therefore stay correct across midnight without a manual reload.
 */
export function useLocalDayBounds(): { startMs: number; endMs: number } {
  const [bounds, setBounds] = useState<{ startMs: number; endMs: number }>(() =>
    getLocalDayBoundsMs()
  );

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const recompute = () => {
      if (cancelled) return;
      const next = getLocalDayBoundsMs();
      setBounds((prev) =>
        prev.startMs === next.startMs && prev.endMs === next.endMs ? prev : next
      );
    };

    const scheduleNextTick = () => {
      if (cancelled) return;
      const delay = nextLocalDayRolloverDelayMs(Date.now());
      timeoutId = setTimeout(() => {
        recompute();
        scheduleNextTick();
      }, delay);
    };

    const onVisibilityOrFocus = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      recompute();
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      scheduleNextTick();
    };

    scheduleNextTick();

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityOrFocus);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", onVisibilityOrFocus);
    }

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityOrFocus);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onVisibilityOrFocus);
      }
    };
  }, []);

  return bounds;
}
