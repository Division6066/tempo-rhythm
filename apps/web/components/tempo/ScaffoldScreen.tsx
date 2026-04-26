import { Button, Pill, SoftCard } from "@tempo/ui/primitives";

/**
 * ScaffoldScreen now renders a concrete beta-safe route shell that mirrors the
 * hierarchy from the design references while avoiding claims of production
 * readiness until backend/payment/legal wiring is finalized.
 */
type Props = {
  title: string;
  category: string;
  source: string;
  summary?: string;
};

const routeStateCards = [
  {
    label: "Loading state",
    tone: "sunken" as const,
    body: "Fetching live data from existing APIs. If this takes longer than expected, content will remain in preview mode.",
  },
  {
    label: "Empty state",
    tone: "default" as const,
    body: "No connected records yet. Use the primary action to create starter content or continue in guided setup.",
  },
  {
    label: "Error state",
    tone: "default" as const,
    body: "We could not load this screen from production services. Retry is safe; no billing or legal actions are submitted from this preview.",
  },
];

export function ScaffoldScreen({ title, category, source, summary }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="orange">{category}</Pill>
          <Pill tone="slate">Beta preview</Pill>
          <span className="text-caption font-tabular text-muted-foreground">
            Reference: {source}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-h1 font-serif">{title}</h1>
          <p className="text-body leading-relaxed text-muted-foreground">
            {summary ??
              "This route has been ported to a concrete layout shell that follows the approved design hierarchy while we complete backend hardening."}
          </p>
        </div>

        <SoftCard tone="sunken" padding="md">
          <p className="text-small leading-relaxed text-muted-foreground">
            Tempo Flow is in closed beta. Payments, legal policy flows, and some
            integrations are intentionally non-blocking placeholders on this
            page until compliance and provider contracts are finalized.
          </p>
        </SoftCard>
      </header>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Primary calls to action">
        <SoftCard padding="md" className="md:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <h2 className="text-h3 font-serif">Primary action</h2>
            <p className="text-small text-muted-foreground">
              Continue with the main workflow from this screen. Uses only currently available API capabilities.
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button variant="primary" size="sm">Continue in beta</Button>
              <Button variant="soft" size="sm">Review guidance</Button>
            </div>
          </div>
        </SoftCard>

        <SoftCard tone="sunken" padding="md">
          <div className="flex h-full flex-col gap-3">
            <h2 className="text-h3 font-serif">Secondary action</h2>
            <p className="text-small text-muted-foreground">
              Open supporting setup without blocking the core flow.
            </p>
            <Button variant="ghost" size="sm" disabled>
              Integration pending
            </Button>
          </div>
        </SoftCard>
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Readiness disclaimers">
        <SoftCard padding="md">
          <h2 className="font-eyebrow">Payments readiness</h2>
          <p className="mt-2 text-small text-muted-foreground">
            Billing UI is shown for hierarchy validation only. Charging,
            invoicing, and tax handling are not yet connected on this route.
          </p>
        </SoftCard>

        <SoftCard padding="md">
          <h2 className="font-eyebrow">Integration readiness</h2>
          <p className="mt-2 text-small text-muted-foreground">
            Connected apps appear as placeholders where direct provider wiring
            is pending. Users can continue core beta workflows without setup.
          </p>
        </SoftCard>
      </section>

      <section className="space-y-3" aria-label="Route state variants">
        <h2 className="text-h3 font-serif">Route states</h2>
        <p className="text-small text-muted-foreground">
          These state blocks intentionally avoid production language and are
          safe defaults until final data contracts are complete.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {routeStateCards.map((card) => (
            <SoftCard key={card.label} tone={card.tone} padding="md">
              <h3 className="font-eyebrow">{card.label}</h3>
              <p className="mt-2 text-small text-muted-foreground">{card.body}</p>
            </SoftCard>
          ))}
        </div>
      </section>
    </main>
  );
}
