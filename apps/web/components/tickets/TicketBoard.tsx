"use client";

import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { useMemo, useState } from "react";
import type { Ticket, TicketBoardData, TicketState } from "./types";

const columns: Array<{
  state: TicketState;
  label: string;
  tone: "neutral" | "moss" | "amber" | "slate" | "orange";
}> = [
  { state: "backlog", label: "Backlog", tone: "neutral" },
  { state: "ready", label: "Ready", tone: "orange" },
  { state: "in_progress", label: "In progress", tone: "slate" },
  { state: "review", label: "Review", tone: "amber" },
  { state: "done", label: "Done", tone: "moss" },
];

const stateLabels: Record<TicketState, string> = Object.fromEntries(
  columns.map((column) => [column.state, column.label])
) as Record<TicketState, string>;

type TicketBoardProps = {
  data: TicketBoardData;
};

export function TicketBoard({ data }: TicketBoardProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    data.tickets[0]?.id ?? null
  );

  const ticketsByState = useMemo(() => {
    const grouped = new Map<TicketState, Ticket[]>();
    for (const column of columns) {
      grouped.set(column.state, []);
    }
    for (const ticket of data.tickets) {
      grouped.get(ticket.state)?.push(ticket);
    }
    return grouped;
  }, [data.tickets]);

  const selectedTicket =
    data.tickets.find((ticket) => ticket.id === selectedTicketId) ?? data.tickets[0] ?? null;

  if (data.tickets.length === 0) {
    return <TicketsEmptyState projectName={data.projectName} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8">
      <TicketBoardHeader projectName={data.projectName} />

      <section
        className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]"
        aria-label="Ticket board and detail pane"
      >
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[1120px] grid-cols-5 gap-3">
            {columns.map((column) => {
              const tickets = ticketsByState.get(column.state) ?? [];
              return (
                <TicketColumn
                  key={column.state}
                  state={column.state}
                  label={column.label}
                  tone={column.tone}
                  tickets={tickets}
                  selectedTicketId={selectedTicket?.id ?? null}
                  onSelectTicket={setSelectedTicketId}
                />
              );
            })}
          </div>
        </div>

        <TicketDetail ticket={selectedTicket} />
      </section>
    </main>
  );
}

function TicketBoardHeader({ projectName }: { projectName: string }) {
  return (
    <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="slate">{projectName}</Pill>
          <Pill tone="orange">Evidence-led</Pill>
        </div>
        <div className="space-y-2">
          <h1 className="text-h1 font-serif">Ticket board</h1>
          <p className="max-w-3xl text-body text-muted-foreground">
            See every ticket by state, open one to inspect dependencies, and keep the command
            evidence close to the decision it supports.
          </p>
        </div>
      </div>

      <form className="rounded-xl border border-border bg-card p-4 shadow-whisper">
        <label className="font-eyebrow" htmlFor="ticket-intent">
          Add an intent
        </label>
        <textarea
          className="mt-3 min-h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-small text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          id="ticket-intent"
          name="intent"
          placeholder="Paste a rough request. AW-31 will turn it into a proposed ticket."
        />
        <Button className="mt-3 w-full" size="sm" type="submit">
          Submit intent
        </Button>
      </form>
    </header>
  );
}

function TicketColumn({
  state,
  label,
  tone,
  tickets,
  selectedTicketId,
  onSelectTicket,
}: {
  state: TicketState;
  label: string;
  tone: "neutral" | "moss" | "amber" | "slate" | "orange";
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
}) {
  return (
    <section
      aria-label={`${label} tickets`}
      className="flex min-h-[520px] flex-col rounded-2xl border border-border-soft bg-surface-sunken/60 p-3"
      data-count={tickets.length}
      data-testid={`column-${state.replace("_", "-")}`}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-small font-semibold">{label}</h2>
          <p className="text-caption text-muted-foreground">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </p>
        </div>
        <Pill tone={tone}>{tickets.length}</Pill>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            selected={ticket.id === selectedTicketId}
            onSelect={() => onSelectTicket(ticket.id)}
          />
        ))}
      </div>
    </section>
  );
}

function TicketCard({
  ticket,
  selected,
  onSelect,
}: {
  ticket: Ticket;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={selected}
      aria-label={`Open ${ticket.id} — ${ticket.title}`}
      className={[
        "rounded-xl border bg-card p-4 text-left shadow-whisper transition",
        "hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary" : "border-border",
      ].join(" ")}
      data-testid="ticket-card"
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-caption text-muted-foreground">{ticket.id}</span>
        <Pill tone={ticket.dependsOn.length > 0 ? "slate" : "neutral"}>
          {ticket.dependsOn.length} deps
        </Pill>
      </div>
      <h3 className="mt-3 text-small font-semibold leading-snug">{ticket.title}</h3>
      <p className="mt-2 line-clamp-3 text-caption leading-relaxed text-muted-foreground">
        {ticket.summary}
      </p>
    </button>
  );
}

function TicketDetail({ ticket }: { ticket: Ticket | null }) {
  if (!ticket) {
    return null;
  }

  return (
    <aside
      className="sticky top-4 h-fit rounded-2xl border border-border bg-card p-5 shadow-card"
      data-testid="ticket-detail"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-caption text-muted-foreground">{stateLabels[ticket.state]}</p>
          <h2 className="mt-1 text-h2 font-serif">{ticket.id}</h2>
        </div>
        <Pill tone="orange">{ticket.owner}</Pill>
      </div>

      <h3 className="mt-4 text-body font-semibold">{ticket.title}</h3>
      <p className="mt-2 text-small leading-relaxed text-muted-foreground">{ticket.summary}</p>

      <section className="mt-6" aria-labelledby="ticket-dependencies-heading">
        <h3 className="font-eyebrow" id="ticket-dependencies-heading">
          Depends on
        </h3>
        {ticket.dependsOn.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {ticket.dependsOn.map((dependencyId) => (
              <a
                className="rounded-full border border-border bg-background px-3 py-1 text-small font-medium text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`#${dependencyId}`}
                key={dependencyId}
              >
                {dependencyId}
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-small text-muted-foreground">No blocking dependencies.</p>
        )}
      </section>

      <section className="mt-6" aria-labelledby="ticket-evidence-heading">
        <h3 className="font-eyebrow" id="ticket-evidence-heading">
          Evidence log
        </h3>
        <div className="mt-3 space-y-3">
          {ticket.evidence.length > 0 ? (
            ticket.evidence.map((entry) => (
              <article
                className="rounded-xl border border-border-soft bg-background p-3"
                data-testid="evidence-entry"
                key={entry.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <code className="font-mono text-caption text-foreground">{entry.command}</code>
                  <Pill tone={entry.exitCode === 0 ? "moss" : "brick"}>exit {entry.exitCode}</Pill>
                </div>
                <p className="mt-2 text-caption leading-relaxed text-muted-foreground">
                  {entry.note}
                </p>
                <p className="mt-2 font-mono text-caption text-subtle-foreground">
                  {entry.createdAt}
                </p>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border p-3 text-small text-muted-foreground">
              No evidence has been attached yet.
            </p>
          )}
        </div>
      </section>
    </aside>
  );
}

function TicketsEmptyState({ projectName }: { projectName: string }) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-5xl place-items-center px-6 py-12">
      <SoftCard className="max-w-2xl text-center" padding="lg">
        <Pill tone="slate">{projectName}</Pill>
        <h1 className="mt-5 text-h1 font-serif">No tickets here yet</h1>
        <p className="mx-auto mt-3 max-w-xl text-body leading-relaxed text-muted-foreground">
          When a project has tickets, they will appear by state here. You can start with one
          rough intent and keep the board calm until real work arrives.
        </p>
        <form className="mx-auto mt-6 max-w-lg text-left">
          <label className="font-eyebrow" htmlFor="empty-ticket-intent">
            First intent
          </label>
          <textarea
            className="mt-3 min-h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-small text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            id="empty-ticket-intent"
            name="intent"
            placeholder="Describe the next useful agent job."
          />
          <Button className="mt-3 w-full" size="sm" type="submit">
            Submit intent
          </Button>
        </form>
      </SoftCard>
    </main>
  );
}
