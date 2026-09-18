import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { MdEditor } from "@/components/tempo/md-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAboutSource, enhanceMarkdown, makeClozeAi, makeStudyGuide, makeStudySetAi } from "@/lib/tempo/ai";
import { backlinksTo } from "@/lib/tempo/note-syntax";
import {
  cardsFromMarkdown,
  clozeFromMarkdown,
  materializeCards,
  materializeCloze,
  materializeQuiz,
  quizFromCards,
  studyGuideLocal,
} from "@/lib/tempo/study-local";
import { studioStore, useStudio } from "@/lib/tempo/studio";
import { useState } from "react";

export function NoteEditor({ id }: { id: string }) {
  const { notes, dailyNotes, mapCards } = useStudio();
  const navigate = useNavigate();
  const [ask, setAsk] = useState("");
  const [askLog, setAskLog] = useState<string | null>(null);
  const note = notes.find((n) => n.id === id) ?? notes.find((n) => n.title.toLowerCase() === decodeURIComponent(id).toLowerCase());
  const title = note?.title ?? decodeURIComponent(id);
  const body = note?.body ?? `# ${title}\n\nNothing here yet. Write in markdown — Tempo will keep it.`;
  const backlinks = backlinksTo(title, [
    ...notes.map((n) => ({ id: n.id, title: n.title, body: n.body })),
    ...Object.entries(dailyNotes).map(([day, b]) => ({ id: `day:${day}`, title: `Daily · ${day}`, body: b })),
  ]);
  const wikiOptions = notes.map((n) => ({ id: n.id, title: n.title }));

  if (!note) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-sm text-muted">That page isn't in the library yet.</p>
        <Button
          onClick={() => {
            const created = studioStore.addNote(title, body);
            navigate({ to: "/notes/$id", params: { id: created.id } });
          }}
        >
          Start it
        </Button>
      </div>
    );
  }

  const doc = note;

  async function agent(slash: string, source: string) {
    if (slash === "/pin") {
      studioStore.addMapCard({
        title: doc.title,
        body: source.slice(0, 280),
        noteId: doc.id,
        x: 80 + mapCards.length * 28,
        y: 80 + mapCards.length * 20,
      });
      toast("Pinned to the map.");
      navigate({ to: "/map" });
      return;
    }
    if (slash === "/enhance") {
      try {
        const res = await enhanceMarkdown({ data: { raw: source } });
        if (res.ok && res.markdown) {
          studioStore.updateNote(doc.id, { body: res.markdown });
          toast("Structured.");
        } else toast("Coach was quiet.");
      } catch {
        toast("Couldn't reach the coach.");
      }
      return;
    }
    if (slash === "/cards" || slash === "/guide" || slash === "/blank") {
      try {
        const res = await makeStudySetAi({ data: { markdown: source, title: doc.title } });
        const cards = res.ok && res.set ? res.set.cards : cardsFromMarkdown(source);
        const quiz = res.ok && res.set ? res.set.quiz : quizFromCards(cards);
        let cloze = res.ok && res.set?.cloze?.length ? res.set.cloze : clozeFromMarkdown(source);
        let guideMd = res.ok && res.set?.guideMd ? res.set.guideMd : studyGuideLocal(source, doc.title);
        if (slash === "/guide") {
          const g = await makeStudyGuide({ data: { markdown: source, title: doc.title } });
          if (g.ok && g.markdown) guideMd = g.markdown;
        }
        if (slash === "/blank") {
          const c = await makeClozeAi({ data: { markdown: source } });
          if (c.ok && c.items?.length) cloze = c.items;
        }
        const set = studioStore.addStudySet({
          title: doc.title,
          sourceNoteId: doc.id,
          notesMd: res.ok && res.set ? res.set.notesMd : source,
          cards: materializeCards(cards),
          quiz: materializeQuiz(quiz),
          cloze: materializeCloze(cloze),
          guideMd,
        });
        toast(res.ok ? "Study set ready." : "Pulled terms from the page.");
        navigate({ to: "/study/$id", params: { id: set.id } });
      } catch {
        toast("Couldn't make cards.");
      }
      return;
    }
    if (slash === "/ask") {
      try {
        const res = await askAboutSource({
          data: { question: "What are the three ideas on this page?", context: source },
        });
        setAskLog(res.ok && res.text ? res.text : "Coach was quiet.");
      } catch {
        setAskLog("Couldn't reach the coach.");
      }
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <p className="text-sm text-muted">
        <Link to="/notes" className="hover:text-ink">
          Notes
        </Link>{" "}
        · markdown
      </p>
      <Input
        value={doc.title}
        onChange={(e) => studioStore.updateNote(doc.id, { title: e.target.value })}
        className="h-auto border-0 bg-transparent px-0 font-display text-3xl font-medium tracking-tight md:text-4xl"
      />
      <MdEditor
        value={doc.body}
        onChange={(next) => studioStore.updateNote(doc.id, { body: next })}
        minHeight={480}
        wikiOptions={wikiOptions}
        onAgent={(slash, source) => void agent(slash, source)}
      />
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void askAboutSource({ data: { question: ask || "Summarize this page in three sentences.", context: doc.body } })
            .then((res) => setAskLog(res.ok && res.text ? res.text : "Coach was quiet."))
            .catch(() => setAskLog("Couldn't reach the coach."));
        }}
      >
        <input
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          placeholder="Ask about this page…"
          className="h-11 flex-1 rounded-md border border-border bg-surface px-3 text-sm"
        />
        <Button type="submit" variant="outline">
          Ask
        </Button>
      </form>
      {askLog ? <p className="rounded-xl bg-accent-soft px-4 py-3 font-display text-[15px] leading-relaxed">{askLog}</p> : null}
      {backlinks.length > 0 ? (
        <section>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Linked from</p>
          <ul className="flex flex-wrap gap-2">
            {backlinks.map((b) => (
              <li key={b.id}>
                {b.id.startsWith("day:") ? (
                  <Link to="/daily-note" className="rounded-full border border-border px-3 py-1 text-xs text-accent">
                    {b.title}
                  </Link>
                ) : (
                  <Link
                    to="/notes/$id"
                    params={{ id: b.id }}
                    className="rounded-full border border-border px-3 py-1 text-xs text-accent"
                  >
                    [[{b.title}]]
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
