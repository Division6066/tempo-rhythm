"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button, Pill, SoftCard, type PillTone } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * DemoScreenLayout — shared two-column layout used by all non-hero tempo routes.
 * Keeps every screen looking like a real product page while making it trivial
 * to wire backend behavior per-action (each control carries its own pseudocode
 * tags via the `tagDescription` it passes into the onClick toast).
 *
 * @source docs/design/claude-export/design-system/components.jsx (page-header + cards)
 */
export type DemoAction =
  | { type: "toast"; label: string; tagDescription: string; variant?: "primary" | "soft" | "ghost" | "inverse" | "destructive" | "subtle" }
  | { type: "link"; label: string; href: string; variant?: "primary" | "soft" | "ghost" | "inverse" | "destructive" | "subtle" };

export type DemoCard = {
  id: string;
  title?: string;
  eyebrow?: string;
  tone?: "default" | "sunken" | "inverse";
  items?: Array<{
    id: string;
    title: string;
    meta?: string;
    tone?: PillTone;
    tag?: string;
    trailing?: ReactNode;
    href?: string;
  }>;
  /** Tagged pseudocode block describing the card's queries/mutations. */
  tags?: Array<{ type: string; value: string }>;
  footer?: ReactNode;
  renderContent?: () => ReactNode;
};

export type DemoScreenLayoutProps = {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  badge?: { label: string; tone?: PillTone };
  headerActions?: DemoAction[];
  primary: DemoCard[];
  sidebar?: DemoCard[];
  /** Tags rendered in a compact footer strip on the page for backend hand-off. */
  pseudocode?: Array<{ type: string; value: string }>;
};

function renderAction(
  action: DemoAction,
  toast: (message: string) => void,
): ReactNode {
  if (action.type === "link") {
    return (
      <Link key={action.label} href={action.href}>
        <Button variant={action.variant ?? "soft"} size="sm">
          {action.label}
        </Button>
      </Link>
    );
  }
  return (
    <Button
      key={action.label}
      variant={action.variant ?? "primary"}
      size="sm"
      onClick={() => toast(`${action.label}. (demo) ${action.tagDescription}.`)}
    >
      {action.label}
    </Button>
  );
}

function RenderCard({ card }: { card: DemoCard }) {
  const toast = useDemoToast();
  const router = useRouter();
  const tone = card.tone ?? "default";

  return (
    <SoftCard tone={tone} padding="md" id={card.id}>
      {(card.eyebrow || card.title) ? (
        <header className="mb-3 flex items-center justify-between">
          <div>
            {card.eyebrow ? <div className="font-eyebrow">{card.eyebrow}</div> : null}
            {card.title ? (
              <h3 className="font-serif text-h4">{card.title}</h3>
            ) : null}
          </div>
        </header>
      ) : null}

      {card.renderContent ? card.renderContent() : null}

      {card.items && card.items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {card.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-surface-sunken p-3"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                {item.href ? (
                  /*
                   * @behavior: Navigate to the row's detail page.
                   * @navigate: from item.href on click
                   */
                  <button
                    type="button"
                    onClick={() => router.push(item.href as string)}
                    className="truncate text-left text-body hover:underline"
                  >
                    {item.title}
                  </button>
                ) : (
                  <span className="truncate text-body">{item.title}</span>
                )}
                {item.meta ? (
                  <span className="text-caption text-muted-foreground">
                    {item.meta}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {item.tag ? <Pill tone={item.tone ?? "neutral"}>{item.tag}</Pill> : null}
                {item.trailing ?? null}
                {/*
                 * @behavior: Open row quick-actions menu (complete / snooze / archive).
                 * @convex-mutation-needed: (per-row) tasks.complete | notes.archive | ...
                 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast(`Opened "${item.title.slice(0, 28)}". (demo) row-quick-actions.`)}
                  aria-label={`More actions for ${item.title}`}
                >
                  …
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {card.tags && card.tags.length > 0 ? (
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-border-soft bg-surface p-3 text-caption text-muted-foreground">
          {card.tags.map((t) => `${t.type}: ${t.value}`).join("\n")}
        </pre>
      ) : null}

      {card.footer ? <div className="mt-3 flex items-center gap-2">{card.footer}</div> : null}
    </SoftCard>
  );
}

export function DemoScreenLayout(props: DemoScreenLayoutProps) {
  const toast = useDemoToast();

  const headerRight = props.headerActions?.map((action) =>
    renderAction(action, toast),
  );

  const primaryCol = (
    <div className="flex flex-col gap-5">
      {props.primary.map((card) => (
        <RenderCard key={card.id} card={card} />
      ))}
    </div>
  );

  const sidebarCol =
    props.sidebar && props.sidebar.length > 0 ? (
      <div className="flex flex-col gap-5">
        {props.sidebar.map((card) => (
          <RenderCard key={card.id} card={card} />
        ))}
      </div>
    ) : null;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow={props.eyebrow}
        title={props.title}
        lede={props.lede}
        badge={props.badge}
        right={headerRight}
      />
      <div
        className={[
          "grid gap-5 px-6 py-6",
          sidebarCol ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : "",
        ].join(" ")}
      >
        {primaryCol}
        {sidebarCol}
      </div>

      {props.pseudocode && props.pseudocode.length > 0 ? (
        <div className="px-6 pb-8">
          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Pseudocode · backend wiring</div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-caption text-muted-foreground">
              {props.pseudocode.map((t) => `${t.type}: ${t.value}`).join("\n")}
            </pre>
          </SoftCard>
        </div>
      ) : null}
    </div>
  );
}
