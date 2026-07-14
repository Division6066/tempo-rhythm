import { Pill, SoftCard } from "@tempo/ui/primitives";

type Params = { id: string };

type TicketState = "backlog" | "now" | "done";

type FixtureTicket = {
  id: string;
  title: string;
  summary: string;
  state: TicketState;
};

type KanbanColumn = {
  state: TicketState;
  title: string;
  description: string;
  tone: "neutral" | "amber" | "moss";
};

const fixtureTickets: FixtureTicket[] = [
  {
    id: "AW-34-1",
    title: "Import source brief",
    summary: "Capture the request, constraints, and expected handoff.",
    state: "backlog",
  },
  {
    id: "AW-34-2",
    title: "Map functional jobs",
    summary: "Split the work into trigger, ingest, reason, and observe steps.",
    state: "backlog",
  },
  {
    id: "AW-34-3",
    title: "Select component mix",
    summary: "Choose a minimal toolchain for the agent's first useful loop.",
    state: "now",
  },
  {
    id: "AW-34-4",
    title: "Draft guardrails",
    summary: "Write safe defaults before the agent can act on user data.",
    state: "now",
  },
  {
    id: "AW-34-5",
    title: "Record evidence",
    summary: "Attach the passing browser check to the ticket history.",
    state: "done",
  },
  {
    id: "AW-34-6",
    title: "Confirm handoff",
    summary: "Leave the next agent with clear status and no hidden work.",
    state: "done",
  },
];

const kanbanColumns: KanbanColumn[] = [
  {
    state: "backlog",
    title: "Backlog",
    description: "Useful work that is parked safely for later.",
    tone: "neutral",
  },
  {
    state: "now",
    title: "Now",
    description: "The smallest active slice to keep momentum visible.",
    tone: "amber",
  },
  {
    state: "done",
    title: "Done",
    description: "Completed work with evidence attached.",
    tone: "moss",
  },
];

function ticketsForState(state: TicketState) {
  return fixtureTickets.filter((ticket) => ticket.state === state);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return (
    <main className="mx-auto flex w-full max-w-[var(--container-tempo)] flex-col gap-6 p-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="orange">Library</Pill>
          <Pill tone="slate">Fixture preview</Pill>
          <span className="text-caption font-tabular text-muted-foreground">Project: {id}</span>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-h1 font-serif">Ticket board</h1>
          <p className="text-body leading-relaxed text-muted-foreground">
            Six fixture tickets are grouped by state so the kanban evidence path can be verified
            before live project data is connected.
          </p>
        </div>
      </header>

      <section
        aria-label="Ticket board columns"
        className="grid gap-4 lg:grid-cols-3"
        data-testid="ticket-board"
      >
        {kanbanColumns.map((column) => {
          const tickets = ticketsForState(column.state);

          return (
            <SoftCard
              as="section"
              className="flex min-h-[420px] flex-col gap-4"
              data-testid={`ticket-column-${column.state}`}
              key={column.state}
              padding="md"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <h2 className="text-h3 font-serif">{column.title}</h2>
                  <p className="text-small leading-relaxed text-muted-foreground">
                    {column.description}
                  </p>
                </div>
                <Pill
                  aria-label={`${column.title} ticket count`}
                  data-testid={`ticket-count-${column.state}`}
                  tone={column.tone}
                >
                  {tickets.length}
                </Pill>
              </header>

              <div className="flex flex-1 flex-col gap-3">
                {tickets.map((ticket) => (
                  <article
                    className="rounded-lg border border-border-soft bg-background p-4 shadow-whisper"
                    data-testid="ticket-card"
                    key={ticket.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-body font-semibold">{ticket.title}</h3>
                      <span className="font-tabular text-caption text-muted-foreground">
                        {ticket.id}
                      </span>
                    </div>
                    <p className="mt-2 text-small leading-relaxed text-muted-foreground">
                      {ticket.summary}
                    </p>
                  </article>
                ))}
              </div>
            </SoftCard>
          );
        })}
      </section>
    </main>
  );
}
