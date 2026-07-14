const columns = [
  {
    label: "Backlog",
    tickets: ["AW-01", "AW-12"],
  },
  {
    label: "Verification",
    tickets: ["AW-34"],
  },
  {
    label: "Done",
    tickets: ["AW-00"],
  },
] as const;

const selectedTicket = {
  id: "AW-34",
  title: "AW-34 — Ticket board UI: kanban + evidence log",
  status: "Verification",
  summary:
    "Scoped verification slice for the ticket board detail pane. This fixture asserts dependency links and evidence entries directly in the browser DOM.",
  dependsOn: [
    { id: "AW-01", title: "AW-01 — freeze schema", href: "/tickets/AW-01" },
    {
      id: "AW-12",
      title: "AW-12 — fixture loader",
      href: "/tickets/AW-12",
    },
  ],
  evidence: [
    {
      command: "bun install",
      exitCode: 0,
      note: "Dependency install completed before the browser check.",
    },
    {
      command: "bunx playwright test apps/web/e2e/tickets.spec.ts",
      exitCode: 0,
      note: "DOM assertion for dependencies and evidence rows.",
    },
  ],
} as const;

export default function TicketsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 lg:p-8">
      <header className="space-y-3">
        <p className="font-eyebrow text-muted-foreground">Agentwright</p>
        <div className="space-y-2">
          <h1 className="text-h1 font-serif">Ticket board</h1>
          <p className="max-w-3xl text-body leading-relaxed text-muted-foreground">
            A fixture-backed board for verifying how a selected ticket exposes
            its dependency chain and run evidence. The data here is intentionally
            small so browser tests can assert the actual detail-pane content.
          </p>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-labelledby="ticket-board-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 id="ticket-board-heading" className="text-h3 font-serif">
              Board
            </h2>
            <span className="rounded-full border border-border-soft bg-card px-3 py-1 text-caption text-muted-foreground">
              Fixture mode
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {columns.map((column) => (
              <section
                aria-labelledby={`ticket-column-${column.label}`}
                className="rounded-2xl border border-border-soft bg-surface-sunken p-4"
                key={column.label}
              >
                <h3
                  className="text-small font-semibold text-foreground"
                  id={`ticket-column-${column.label}`}
                >
                  {column.label}
                </h3>
                <ul className="mt-3 space-y-3">
                  {column.tickets.map((ticketId) => {
                    const isSelected = ticketId === selectedTicket.id;
                    return (
                      <li
                        className={[
                          "rounded-xl border p-3 text-small",
                          isSelected
                            ? "border-foreground bg-card text-foreground"
                            : "border-border-soft bg-card/70 text-muted-foreground",
                        ].join(" ")}
                        key={ticketId}
                      >
                        <span className="font-tabular">{ticketId}</span>
                        {isSelected ? (
                          <span className="ml-2 rounded-full bg-surface-sunken px-2 py-0.5 text-caption">
                            selected
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section
          aria-label="Ticket detail"
          className="rounded-2xl border border-border-soft bg-card p-5 shadow-soft"
        >
          <div className="space-y-2">
            <p className="font-eyebrow text-muted-foreground">
              {selectedTicket.status}
            </p>
            <h2 className="text-h2 font-serif">{selectedTicket.title}</h2>
            <p className="text-small leading-relaxed text-muted-foreground">
              {selectedTicket.summary}
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <section aria-labelledby="ticket-dependencies-heading">
              <h3
                className="text-small font-semibold text-foreground"
                id="ticket-dependencies-heading"
              >
                Depends on
              </h3>
              <ul aria-label="Dependencies" className="mt-3 space-y-2">
                {selectedTicket.dependsOn.map((dependency) => (
                  <li key={dependency.id}>
                    <a
                      className="inline-flex rounded-md text-small font-medium text-foreground underline decoration-muted-foreground underline-offset-4 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      href={dependency.href}
                    >
                      {dependency.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="ticket-evidence-heading">
              <h3
                className="text-small font-semibold text-foreground"
                id="ticket-evidence-heading"
              >
                Evidence
              </h3>
              <ul aria-label="Evidence" className="mt-3 space-y-3">
                {selectedTicket.evidence.map((entry) => (
                  <li
                    className="rounded-xl border border-border-soft bg-surface-sunken p-3"
                    key={entry.command}
                  >
                    <p className="font-mono text-caption text-foreground">
                      {entry.command}
                    </p>
                    <p className="mt-2 text-small text-muted-foreground">
                      {entry.note}
                    </p>
                    <p className="mt-2 font-tabular text-caption text-foreground">
                      exit code {entry.exitCode}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
