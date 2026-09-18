import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mic, Radio, Send } from "lucide-react";
import { CoachNudgeCard } from "@/components/tempo/coach-nudge";
import { EmptyState } from "@/components/tempo/empty-state";
import { ErrorState } from "@/components/tempo/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/lib/markdown";
import { coachReply } from "@/lib/tempo/coach-reply";
import { getDataAdapterName } from "@/lib/tempo/config";
import { isOpenTask } from "@/lib/tempo/filters";
import { studioStore, useStudio } from "@/lib/tempo/studio";
import { useTempo } from "@/lib/tempo/use-tempo";
import { cn } from "@/lib/utils";

export function CoachView() {
  const { snapshot, adapter, nudge, setDemo } = useTempo();
  const studio = useStudio();
  const [draft, setDraft] = useState("");

  if (snapshot.demo === "error") {
    return (
      <ErrorState
        message="Couldn't reach the coach. I'll try again in a minute."
        onRetry={() => setDemo("seeded")}
      />
    );
  }

  if (snapshot.demo === "empty") {
    return (
      <EmptyState
        title="Nothing to interrupt you with"
        body="When a commitment goes stale or a skip count climbs, it will land here without you opening this page."
      />
    );
  }

  function send(text: string, via: "text" | "voice" = "text") {
    const trimmed = text.trim();
    if (!trimmed) return;
    studioStore.pushChat("user", trimmed, { via });
    setDraft("");
    const overdue = snapshot.tasks.filter((t) => t.dueAt !== undefined && t.dueAt < Date.now() && isOpenTask(t.status));
    const open = snapshot.tasks.filter((t) => isOpenTask(t.status));
    const reply = coachReply({
      message: trimmed,
      warmth: studio.warmth,
      overdueTitles: overdue.map((t) => t.title),
      openTitles: open.map((t) => t.title),
    });
    window.setTimeout(() => studioStore.pushChat("coach", reply), 450);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Coach</p>
          <h1 className="font-display text-4xl font-medium tracking-tight">A voice that checks in</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => studioStore.setVoiceMode("walkie")}>
            <Radio className="size-3.5" />
            Walkie
          </Button>
          <Button variant="gradient" size="sm" onClick={() => studioStore.setVoiceMode("handsfree")}>
            <Mic className="size-3.5" />
            Hands-free
          </Button>
        </div>
      </header>

      <label className="flex items-center gap-3 text-sm text-muted">
        Warmth
        <input
          type="range"
          min={0}
          max={10}
          value={studio.warmth}
          onChange={(e) => studioStore.setWarmth(Number(e.target.value))}
          className="flex-1 accent-accent"
        />
        <span className="font-mono text-ink">{studio.warmth}</span>
      </label>

      {nudge ? (
        <CoachNudgeCard
          nudge={nudge}
          onAct={async () => {
            if (nudge.relatedTaskId) {
              if (nudge.kind === "energy") {
                await adapter.snooze({ taskId: nudge.relatedTaskId, untilMs: Date.now() + 12 * 60 * 60 * 1000 });
                toast("Parked.");
              } else {
                window.location.href = "/today";
              }
            }
            if (nudge.relatedHabitId) {
              await adapter.completeHabitToday({ habitId: nudge.relatedHabitId });
            }
            await adapter.acknowledgeNudge({ id: nudge.id });
          }}
          onDismiss={() => adapter.acknowledgeNudge({ id: nudge.id })}
        />
      ) : null}

      <div className="flex min-h-[420px] flex-col rounded-xl border border-border bg-surface">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {studio.chat.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3.5 py-2.5",
                  m.role === "user" ? "bg-accent text-accent-fg" : "border border-border bg-accent-soft",
                )}
              >
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.1em] opacity-70">
                  {m.role === "user" ? "You" : "Coach"}
                  {m.via === "voice" ? " · voice" : ""}
                </p>
                {m.role === "coach" ? (
                  <Markdown source={m.text} className="gap-1 [&_p]:font-display [&_p]:text-[15px] [&_p]:leading-relaxed" />
                ) : (
                  <p className="font-display text-[15px] leading-relaxed">{m.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2 border-t border-border p-3">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write to the coach…"
            className="flex-1"
          />
          <Button type="submit" size="icon" aria-label="Send">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
      <Badge variant="accent">DATA_ADAPTER={getDataAdapterName()}</Badge>
    </div>
  );
}
