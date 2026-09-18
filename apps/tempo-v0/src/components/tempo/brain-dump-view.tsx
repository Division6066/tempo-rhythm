import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dumpToTaskTitle, sortDump } from "@/lib/tempo/coach-reply";
import { studioStore, useStudio, countWords } from "@/lib/tempo/studio";
import { useTempo } from "@/lib/tempo/use-tempo";
import { cn } from "@/lib/utils";

export function BrainDumpView() {
  const studio = useStudio();
  const { adapter } = useTempo();
  const [tweakId, setTweakId] = useState<string | null>(null);
  const [tweak, setTweak] = useState("");

  function sort() {
    const items = sortDump(studio.dumpRaw || studio.onboarding.dump);
    studioStore.setDumpItems(items);
  }

  async function accept(id: string) {
    const item = studio.dumpItems.find((d) => d.id === id);
    if (!item) return;
    if (item.kind === "task") {
      await adapter.createQuick({ title: dumpToTaskTitle(item), dueAt: Date.now() });
      toast("Added as a task.");
    } else if (item.kind === "note") {
      studioStore.addNote(item.text.slice(0, 48), `# ${item.text}\n`);
      toast("Kept as a note.");
    } else if (item.kind === "journal") {
      studioStore.addJournal(item.text);
      toast("Kept in the journal.");
    } else {
      toast("Parked. We'll sit with it.");
    }
    studioStore.setDumpItem(id, "accepted");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <p className="text-sm text-muted">Flow · brain dump</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Empty your head.</h1>
        <p className="mt-2 font-display text-muted">Fragments, worries, things you're avoiding — all welcome.</p>
      </header>
      <div className="rounded-xl border border-border bg-surface p-4">
        <Textarea
          value={studio.dumpRaw}
          onChange={(e) => studioStore.setDumpRaw(e.target.value)}
          placeholder="Finish the landing copy. Book dentist. Worry: am I shipping fast enough?"
          className="min-h-44 border-0 bg-transparent font-display text-lg leading-relaxed"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-faint">{countWords(studio.dumpRaw)} words</span>
          <Button onClick={sort} disabled={!studio.dumpRaw.trim() && !studio.onboarding.dump}>
            Sort this
          </Button>
        </div>
      </div>
      {studio.dumpItems.length > 0 ? (
        <section className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            I think I can add this. Accept, tweak, or skip?
          </p>
          {studio.dumpItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent">{item.kind}</p>
                  <p className="mt-1 font-display text-[15px] leading-relaxed">{item.text}</p>
                </div>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase",
                    item.status === "accepted" ? "text-ok" : item.status === "skipped" ? "text-faint" : "text-muted",
                  )}
                >
                  {item.status}
                </span>
              </div>
              {item.status === "pending" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => accept(item.id)}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTweakId(item.id);
                      setTweak(item.text);
                    }}
                  >
                    Tweak
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => studioStore.setDumpItem(item.id, "skipped")}>
                    Skip
                  </Button>
                </div>
              ) : null}
              {tweakId === item.id ? (
                <div className="mt-3 flex gap-2">
                  <Textarea
                    value={tweak}
                    onChange={(e) => setTweak(e.target.value)}
                    className="min-h-20"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      studioStore.setDumpItem(item.id, "tweaked", tweak);
                      setTweakId(null);
                    }}
                  >
                    Save
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
