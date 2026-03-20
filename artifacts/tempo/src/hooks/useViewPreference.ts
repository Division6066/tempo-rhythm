import { useState, useCallback } from "react";
import type { ViewMode } from "@/components/ViewToggle";

export function useViewPreference(
  pageKey: string,
  defaultMode: ViewMode = "list",
  allowedModes: ViewMode[] = ["list", "kanban", "table"]
): [ViewMode, (mode: ViewMode) => void] {
  const storageKey = `tempo-view-${pageKey}`;

  const [mode, setModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "list" || saved === "kanban" || saved === "table") {
        if (allowedModes.includes(saved)) return saved;
        localStorage.removeItem(storageKey);
      }
    } catch {}
    return defaultMode;
  });

  const setMode = useCallback((newMode: ViewMode) => {
    if (!allowedModes.includes(newMode)) return;
    setModeState(newMode);
    try {
      localStorage.setItem(storageKey, newMode);
    } catch {}
  }, [storageKey, allowedModes]);

  return [mode, setMode];
}
