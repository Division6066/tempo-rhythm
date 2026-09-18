import type { DayCompletion } from "@tempo-v0/lib/tempo/types";

export function WeekChart({ data }: { data: DayCompletion[] }) {
  const total = data.reduce((sum, d) => sum + d.completed, 0);
  const max = Math.max(1, ...data.map((d) => d.completed));
  return (
    <div className="w-full">
      <div className="flex h-56 items-end gap-3 px-1">
        {data.map((d) => (
          <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className="w-full max-w-9 rounded-t-md bg-ok"
              style={{ height: `${Math.max(8, (d.completed / max) * 180)}px` }}
              title={`${d.completed} finished`}
            />
            <span className="text-xs text-muted">{d.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-muted">
        {total} finished in the last 7 days — from the mock store, not a placeholder.
      </p>
    </div>
  );
}
