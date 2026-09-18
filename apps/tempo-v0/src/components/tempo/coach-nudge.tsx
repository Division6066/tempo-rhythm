import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoachNudge } from "@/lib/tempo/types";

export function CoachNudgeCard({
  nudge,
  onAct,
  onDismiss,
}: {
  nudge: CoachNudge;
  onAct: () => void;
  onDismiss: () => void;
}) {
  return (
    <aside
      aria-label="Unprompted reminder"
      className="rounded-xl border border-accent/25 bg-accent-soft/70 p-5 shadow-(--shadow-soft)"
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Tempo noticed</p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-tight text-ink">{nudge.headline}</h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink/80">{nudge.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onAct} className="min-h-11">
          {nudge.cta}
          <ArrowRight className="size-4" />
        </Button>
        <Button variant="ghost" onClick={onDismiss}>
          {nudge.dismissLabel}
        </Button>
      </div>
    </aside>
  );
}
