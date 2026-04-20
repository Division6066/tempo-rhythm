"use client";

import type { ReactNode } from "react";
import { Button, SoftCard } from "@tempo/ui/primitives";

export type ViewMode = "ready" | "loading" | "empty" | "error";

type ScreenSurfaceProps = {
  children: ReactNode;
  mode: ViewMode;
  onModeChange: (next: ViewMode) => void;
  emptyTitle?: string;
  emptyBody?: string;
  errorMessage?: string;
};

/**
 * Local preview states for mock-data screens (Long Run 2 removes this strip).
 * @action setPreviewMode
 * @mutation none
 * @auth: required
 * @errors none
 * @env: NEXT_PUBLIC_CONVEX_URL (preview only; no network in mock phase)
 */
export function ScreenSurface({
  children,
  mode,
  onModeChange,
  emptyTitle = "Nothing here yet",
  emptyBody = "When you add items, they will show in this view.",
  errorMessage = "We could not load this. Check your connection and try again.",
}: ScreenSurfaceProps) {
  const modes: ViewMode[] = ["ready", "loading", "empty", "error"];
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {mode === "loading" ? (
          <div className="mx-auto max-w-3xl space-y-4 p-8" aria-busy="true" aria-live="polite">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-sunken" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-surface-sunken" />
            <div className="h-40 w-full animate-pulse rounded-xl bg-surface-sunken" />
          </div>
        ) : null}
        {mode === "empty" ? (
          <div className="mx-auto max-w-3xl p-8">
            <SoftCard tone="sunken" padding="lg">
              <h2 className="text-h2 font-serif text-foreground">{emptyTitle}</h2>
              <p className="mt-2 text-body text-muted-foreground">{emptyBody}</p>
            </SoftCard>
          </div>
        ) : null}
        {mode === "error" ? (
          <div className="mx-auto max-w-3xl p-8">
            <SoftCard tone="default" padding="lg" className="border-destructive/40">
              <p className="text-body text-destructive">{errorMessage}</p>
              {/*
                @action retryLoad
                @query: re-run parent screen queries (tasks.listToday etc.)
                @index: n/a
                @soft-delete: n/a
                @optimistic: none
                @auth: required
                @errors: toast if still failing
                @env: NEXT_PUBLIC_CONVEX_URL
              */}
              <Button
                type="button"
                variant="soft"
                className="mt-4"
                onClick={() => onModeChange("ready")}
              >
                Try again
              </Button>
            </SoftCard>
          </div>
        ) : null}
        {mode === "ready" ? <div className="min-h-0">{children}</div> : null}
      </div>
      <div className="border-t border-border-soft bg-card px-4 py-2">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
          <span className="text-caption text-muted-foreground">Preview</span>
          {modes.map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={mode === m ? "primary" : "ghost"}
              onClick={() => onModeChange(m)}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
