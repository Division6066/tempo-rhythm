import { toast } from "sonner";
import { CoachNudgeCard } from "@/components/tempo/coach-nudge";
import { EmptyState } from "@/components/tempo/empty-state";
import { ErrorState } from "@/components/tempo/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDataAdapterName } from "@/lib/tempo/config";
import { useTempo } from "@/lib/tempo/use-tempo";
import { DAY_MS } from "@/lib/tempo/windows";

export function CoachView() {
  const { snapshot, adapter, nudge, setDemo, todayEnd } = useTempo();

  if (snapshot.demo === "error") {
    return (
      <ErrorState
        message="Coach is offline because the adapter is in the error fixture."
        onRetry={() => setDemo("seeded")}
      />
    );
  }

  const avoided = snapshot.tasks
    .filter((t) => t.deletedAt === undefined && (t.avoidCount ?? 0) > 0)
    .sort((a, b) => (b.avoidCount ?? 0) - (a.avoidCount ?? 0));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="space-y-1">
        <p className="text-sm text-muted">Coach</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Said without being asked</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          No model is named here. The nudge is a rule over commitments, skip counts, energy, and broken streaks.
          Live extraction from conversation still needs the mock until the graft.
        </p>
      </header>

      {nudge ? (
        <CoachNudgeCard
          nudge={nudge}
          onAct={async () => {
            if (nudge.relatedTaskId) {
              if (nudge.kind === "energy") {
                await adapter.snooze({ taskId: nudge.relatedTaskId, untilMs: todayEnd + DAY_MS / 2 });
                toast("Parked.");
              } else {
                window.location.href = "/";
              }
            }
            if (nudge.relatedHabitId) {
              await adapter.completeHabitToday({ habitId: nudge.relatedHabitId });
            }
            await adapter.acknowledgeNudge({ id: nudge.id });
          }}
          onDismiss={() => adapter.acknowledgeNudge({ id: nudge.id })}
        />
      ) : (
        <EmptyState
          title="Nothing to interrupt you with"
          body="When a commitment goes stale or a skip count climbs, it will land here without you opening this page."
        />
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Avoidance ledger</h2>
        {avoided.length === 0 ? (
          <p className="text-sm text-muted">No skips on file.</p>
        ) : (
          avoided.map((task) => (
            <Card key={task._id} className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="text-sm text-ink">{task.title}</p>
                <p className="mt-1 text-xs text-muted">skipped {task.avoidCount} times</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await adapter.toggleCompletion({ taskId: task._id });
                  toast("Closed the loop.");
                }}
              >
                Close it
              </Button>
            </Card>
          ))
        )}
      </section>

      <p className="text-xs text-faint">
        Built against the mock. Conversation-to-memory extraction is the piece that needs a live adapter.
      </p>
      <Badge variant="accent">DATA_ADAPTER={getDataAdapterName()}</Badge>
    </div>
  );
}
