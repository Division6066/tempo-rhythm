import type { ScreenFixture } from "@tempo/mock-data";
import { Pill, SoftCard } from "@tempo/ui/primitives";

type TempoScreenScaffoldProps = {
  fixture: ScreenFixture;
  routeParams?: Record<string, string>;
};

function formatTags(tags: ScreenFixture["controls"][number]["tags"]): string {
  return tags.map((tag) => `${tag.type}: ${tag.value}`).join("\n");
}

function resolveRouteLabel(route: string, routeParams?: Record<string, string>): string {
  if (!routeParams) {
    return route;
  }

  let resolved = route;
  for (const [key, value] of Object.entries(routeParams)) {
    resolved = resolved.replace(`[${key}]`, value);
  }
  return resolved;
}

export function TempoScreenScaffold({ fixture, routeParams }: TempoScreenScaffoldProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Pill tone="orange">{fixture.category}</Pill>
          <Pill tone="neutral">tier-{fixture.tier.toLowerCase()}</Pill>
          <span className="text-caption text-muted-foreground">mock-driven scaffold</span>
        </div>
        <h1 className="text-h1 font-serif">{fixture.title}</h1>
        <p className="text-body text-muted-foreground">{fixture.summary}</p>
      </header>

      <SoftCard tone="sunken" padding="md">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="font-eyebrow">Route</p>
            <p className="text-small text-muted-foreground">
              {resolveRouteLabel(fixture.route, routeParams)}
            </p>
          </div>
          <div>
            <p className="font-eyebrow">Owner</p>
            <p className="text-small text-muted-foreground">{fixture.owner}</p>
          </div>
          <div>
            <p className="font-eyebrow">PRD refs</p>
            <ul className="list-disc pl-5 text-small text-muted-foreground">
              {fixture.prdRefs.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-eyebrow">Source refs</p>
            <ul className="list-disc pl-5 text-small text-muted-foreground">
              {fixture.sourceRefs.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </div>
        </div>
      </SoftCard>

      <section className="grid gap-4">
        {fixture.controls.map((control) => (
          <SoftCard key={control.id} tone="default" padding="md">
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-h4 font-serif">{control.label}</h2>
                <p className="text-small text-muted-foreground">{control.intent}</p>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-border-soft bg-surface p-3 text-xs text-foreground">
                {formatTags(control.tags)}
              </pre>
            </div>
          </SoftCard>
        ))}
      </section>
    </div>
  );
}
