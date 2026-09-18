import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/lib/markdown";
import { isoDay, studioStore, useStudio } from "@/lib/tempo/studio";
import { renderTemplate, TEMPLATES, templateToJson, type TempoTemplate } from "@/lib/tempo/templates";

export function TemplatesView() {
  const [tag, setTag] = useState<string | null>(null);
  const tags = useMemo(() => [...new Set(TEMPLATES.flatMap((t) => t.tags))].sort(), []);
  const list = tag ? TEMPLATES.filter((t) => t.tags.includes(tag)) : TEMPLATES;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <p className="text-sm text-muted">Library · templates</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Slash, markdown, JSON.</h1>
        <p className="mt-2 max-w-xl font-display text-muted">
          Every template is a JSON document that renders to markdown. Type the slash in a daily note, or open one
          here and read both faces.
        </p>
      </header>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(tag === t ? null : t)}
            className={`rounded-full px-3 py-1 font-mono text-[11px] ${tag === t ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted"}`}
          >
            #{t}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((t) => (
          <TemplateCard key={t.id} t={t} />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ t }: { t: TempoTemplate }) {
  return (
    <Link
      to="/templates/$id"
      params={{ id: t.id }}
      className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
    >
      <p className="font-mono text-[11px] text-accent">{t.slash}</p>
      <h2 className="mt-1 font-display text-2xl">{t.title}</h2>
      <p className="mt-1 text-sm text-muted">{t.description}</p>
      <p className="mt-3 font-mono text-[11px] text-faint">
        {t.kicker} · {t.blocks.length} blocks · {t.cadence}
      </p>
      <p className="mt-2 text-xs text-muted">{t.adhd}</p>
    </Link>
  );
}

export function TemplateDetail({ id }: { id: string }) {
  const t = TEMPLATES.find((x) => x.id === id);
  const studio = useStudio();
  const navigate = useNavigate();
  if (!t) {
    return (
      <p className="text-sm text-muted">
        No template with that id.{" "}
        <Link to="/templates" className="text-accent">
          Back to the index
        </Link>
      </p>
    );
  }
  const rendered = renderTemplate(t);
  const json = templateToJson(t);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <p className="text-sm text-muted">
        <Link to="/templates" className="hover:text-ink">
          Templates
        </Link>{" "}
        · {t.slash}
      </p>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">{t.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.description}</p>
          <p className="mt-2 font-mono text-[11px] text-faint">
            {t.tags.map((x) => `#${x}`).join("  ")} · {t.adhd}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(json);
                toast("JSON copied.");
              } catch {
                toast("Couldn't copy. Select the JSON on the right.");
              }
            }}
          >
            Copy JSON
          </Button>
          <Button
            onClick={() => {
              const day = studio.selectedDay || isoDay();
              const existing = studio.dailyNotes[day] ?? "";
              studioStore.upsertDaily(day, `${existing.trim()}\n\n${rendered}\n`);
              void navigate({ to: "/daily-note" });
            }}
          >
            Insert into today
          </Button>
        </div>
      </header>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Rendered markdown</p>
          <Markdown source={rendered} />
        </section>
        <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-mkt-bg p-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mkt-subtle">Source JSON</p>
          <JsonBlock json={json} />
        </section>
      </div>
    </div>
  );
}

function JsonBlock({ json }: { json: string }) {
  return (
    <pre className="max-w-full overflow-x-auto font-mono text-[11px] leading-relaxed break-all text-mkt-fg">
      <code>
        {json.split("\n").map((line, i) => {
          const m = line.match(/^(\s*)("(?:\\.|[^"])+")(\s*:\s*)(.*)$/);
          if (!m) {
            return (
              <span key={i} className="block">
                {line}
              </span>
            );
          }
          return (
            <span key={i} className="block">
              {m[1]}
              <span className="text-accent">{m[2]}</span>
              {m[3]}
              <span className="text-mkt-muted">{m[4]}</span>
            </span>
          );
        })}
      </code>
    </pre>
  );
}
