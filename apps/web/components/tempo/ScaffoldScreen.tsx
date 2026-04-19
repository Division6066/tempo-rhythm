import { SoftCard } from "@tempo/ui/primitives";
import { Pill } from "@tempo/ui/primitives";

/**
 * ScaffoldScreen — placeholder body every T-F004 route renders
 * until T-F005* ports the real JSX. Kept deliberately sparse so that
 * the empty state itself communicates "not yet wired".
 */
type Props = {
  title: string;
  category: string;
  source: string;
  summary?: string;
};

export function ScaffoldScreen({ title, category, source, summary }: Props) {
  return (
    <div className="mx-auto max-w-3xl p-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Pill tone="orange">{category}</Pill>
        <span className="text-caption font-tabular text-muted-foreground">
          scaffold · not ported
        </span>
      </div>
      <h1 className="text-h1 font-serif">{title}</h1>
      {summary ? (
        <p className="text-body text-muted-foreground leading-relaxed">
          {summary}
        </p>
      ) : null}
      <SoftCard tone="sunken" padding="md">
        <div className="flex flex-col gap-2">
          <span className="font-eyebrow">Next step</span>
          <span className="text-small text-muted-foreground font-tabular">
            Port from{" "}
            <code className="rounded bg-card px-1.5 py-0.5 border border-border-soft">
              {source}
            </code>
            . See <code className="rounded bg-card px-1.5 py-0.5 border border-border-soft">
              docs/design/pseudo-code-conventions.md
            </code>{" "}
            for annotation rules.
          </span>
        </div>
      </SoftCard>
    </div>
  );
}
