import { useState } from "react";
import { toast } from "@/lib/tempo-graft/toast";
import { EmptyState } from "@tempo-v0/components/tempo/empty-state";
import { ErrorState } from "@tempo-v0/components/tempo/error-state";
import { Badge } from "@tempo-v0/components/ui/badge";
import { Button } from "@tempo-v0/components/ui/button";
import { Input } from "@tempo-v0/components/ui/input";
import { useTempo } from "@tempo-v0/lib/tempo/use-tempo";
import type { MemoryKind, MemorySector } from "@tempo-v0/lib/tempo/types";

const SECTOR_LABEL: Record<MemorySector, string> = {
  semantic: "Fact",
  episodic: "Event",
  procedural: "How",
  emotional: "Feeling",
  general: "General",
};

const KIND_VARIANT: Record<MemoryKind, "accent" | "overdue" | "default"> = {
  commitment: "accent",
  avoidance: "overdue",
  fact: "default",
};

export function MemoryView() {
  const { snapshot, adapter, setDemo } = useTempo();
  const [draft, setDraft] = useState("");

  if (snapshot.demo === "error") {
    return (
      <ErrorState
        message="Memory could not be read. The adapter is in the error fixture."
        onRetry={() => setDemo("seeded")}
      />
    );
  }

  const memories = snapshot.memories
    .filter((m) => m.deletedAt === undefined)
    .sort((a, b) => b.salience - a.salience);
  const commitments = memories.filter((m) => m.metadata?.kind === "commitment");
  const avoidances = memories.filter((m) => m.metadata?.kind === "avoidance");

  async function add() {
    const content = draft.trim();
    if (!content) return;
    await adapter.addMemory({ content, sector: "general", salience: 0.55 });
    setDraft("");
    toast("Stored.");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="space-y-1">
        <p className="text-sm text-muted">Memory</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">What Tempo is holding</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Commitments and avoided loops sit at the top. Salience decays when a memory is not touched.
        </p>
      </header>

      {memories.length === 0 ? (
        <EmptyState
          title="Nothing remembered yet"
          body="Tempo cannot surface what you keep avoiding until it has something to hold. Write one sentence."
          actionLabel="Add a memory"
          onAction={() => document.getElementById("memory-composer")?.focus()}
        />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Commitments</p>
              <p className="mt-2 font-display text-3xl tabular-nums">{commitments.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Avoided loops</p>
              <p className="mt-2 font-display text-3xl tabular-nums text-overdue">{avoidances.length}</p>
            </div>
          </section>

          <ul className="space-y-3">
            {memories.map((memory) => {
              const kind = memory.metadata?.kind ?? "fact";
              return (
                <li key={memory._id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={KIND_VARIANT[kind]}>{kind}</Badge>
                    <Badge>{SECTOR_LABEL[memory.sector]}</Badge>
                    <span className="ml-auto font-mono text-xs tabular-nums text-faint">
                      {Math.round(memory.salience * 100)} salience
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink">{memory.content}</p>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
      >
        <Input
          id="memory-composer"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="A sentence Tempo should not forget"
        />
        <Button type="submit" disabled={!draft.trim()}>
          Keep
        </Button>
      </form>
    </div>
  );
}
