import { getDataAdapterName } from "@/lib/tempo/config";
import type { DemoMode } from "@/lib/tempo/types";
import { cn } from "@/lib/utils";

export function DemoRail({
  demo,
  onChange,
}: {
  demo: DemoMode;
  onChange: (mode: DemoMode) => void;
}) {
  const adapter = getDataAdapterName();
  return (
    <div className="border-t border-border bg-surface-2/50 px-4 py-3 pb-20 md:pb-3">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Fixture · adapter <span className="font-mono text-ink">{adapter}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(["seeded", "empty", "error"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange(mode)}
              className={cn(
                "h-9 rounded-full px-3 text-xs font-medium capitalize",
                demo === mode ? "bg-ink text-bg" : "bg-surface text-muted hover:text-ink",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
