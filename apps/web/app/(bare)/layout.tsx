import type { ReactNode } from "react";

/**
 * (bare) layout — no sidebar, no topbar. Used for screens that need
 * focus mode: auth, onboarding, template builder/run, trial-end.
 */
export default function BareLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
