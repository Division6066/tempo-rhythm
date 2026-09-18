import { Link } from "@/lib/tempo-graft/router";
import { Button } from "@tempo-v0/components/ui/button";
import { useTempo } from "@tempo-v0/lib/tempo/use-tempo";
import { isOpenTask } from "@tempo-v0/lib/tempo/filters";

const BLOCKS = [
  { label: "Morning · high focus", hint: "Before noon" },
  { label: "Midday · errands", hint: "Short and specific" },
  { label: "Afternoon · soft", hint: "After three is allowed to be light" },
];

export function PlanView() {
  const { today } = useTempo();
  const open = today.filter((t) => isOpenTask(t.status)).slice(0, 3);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <p className="text-sm text-muted">Flow · plan</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Three blocks. You can still say no.</h1>
        <p className="mt-2 font-display text-muted">
          A three-block day, already staged from what's open. Drag is a later graft. Skip is always allowed.
        </p>
      </header>
      <div className="space-y-3">
        {BLOCKS.map((block, i) => (
          <article key={block.label} className="rounded-xl border border-border bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">{block.label}</p>
            <p className="mt-2 font-display text-lg">{open[i]?.title ?? "Nothing staged — add from Today."}</p>
            <p className="text-sm text-muted">{open[i] ? block.hint : "Empty is a valid plan."}</p>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/today">Open today</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/brain-dump">Sort another dump</Link>
        </Button>
      </div>
    </div>
  );
}
