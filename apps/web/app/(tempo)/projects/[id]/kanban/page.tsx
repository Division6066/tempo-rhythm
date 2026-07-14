import { Button, Pill, SoftCard } from "@tempo/ui/primitives";

type Params = { id: string };

const columns = [
  {
    title: "Backlog",
    tone: "slate",
    helper: "Ideas can wait here without pressure.",
  },
  {
    title: "This week",
    tone: "orange",
    helper: "Choose a few when this project is ready.",
  },
  { title: "In progress", tone: "amber", helper: "Active work will appear here." },
  {
    title: "Shipped",
    tone: "moss",
    helper: "Completed cards collect here for review.",
  },
] as const;

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="orange">Project - Kanban</Pill>
          <Pill tone="slate">Empty project</Pill>
          <span className="text-caption font-tabular text-muted-foreground">
            Project ID: {id}
          </span>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-h1 font-serif">A quiet board, ready when you are.</h1>
          <p className="text-body leading-relaxed text-muted-foreground">
            This project does not have tickets yet. You can add a small starter card,
            import tasks later, or leave the board empty while the project takes shape.
          </p>
        </div>
      </header>

      <SoftCard
        as="section"
        padding="lg"
        className="border-dashed"
        aria-labelledby="empty-board-title"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <p className="font-eyebrow text-muted-foreground">Empty state</p>
            <h2 id="empty-board-title" className="text-h2 font-serif">
              Nothing is missing.
            </h2>
            <p className="max-w-2xl text-small leading-relaxed text-muted-foreground">
              Empty boards are a normal starting point. Add one next-step card when it
              feels useful, or keep this space open until the project has a clear shape.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Add a starter card</Button>
            <Button variant="soft" size="sm">
              Import from tasks
            </Button>
          </div>
        </div>
      </SoftCard>

      <section
        className="grid gap-4 xl:grid-cols-4"
        aria-label="Ticket board columns"
      >
        {columns.map((column) => (
          <SoftCard
            key={column.title}
            as="article"
            padding="md"
            className="min-h-72"
          >
            <div className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-h3 font-serif">{column.title}</h2>
                <Pill tone={column.tone}>0</Pill>
              </div>

              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border-soft bg-surface-sunken p-5 text-center">
                <p className="text-small leading-relaxed text-muted-foreground">
                  {column.helper}
                </p>
              </div>
            </div>
          </SoftCard>
        ))}
      </section>
    </div>
  );
}
