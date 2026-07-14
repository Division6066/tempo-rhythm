"use client";

import type { ReactNode } from "react";

const safeMutationNames = [
  "tasks.toggleCompletion",
  "tasks.createQuick",
  "habits.completeToday",
] as const;

export type SafeMutationName = (typeof safeMutationNames)[number];

export type SafeAction = {
  type: "convex.mutation";
  mutation: string;
  args: Record<string, unknown>;
};

type MarkdownBlock = {
  id: string;
  type: "markdown";
  markdown: string;
};

type TaskItem = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  description?: string;
  action?: SafeAction;
};

type TaskViewBlock = {
  id: string;
  type: "task.view";
  title: string;
  items: TaskItem[];
};

type CalendarItem = {
  id: string;
  title: string;
  startsAtLabel: string;
  durationLabel?: string;
  tone?: "calm" | "focus" | "soft";
};

type CalendarViewBlock = {
  id: string;
  type: "calendar.view";
  title: string;
  items: CalendarItem[];
};

type HabitItem = {
  id: string;
  name: string;
  cadence: "daily" | "weekly";
  currentStreak: number;
  action?: SafeAction;
};

type HabitViewBlock = {
  id: string;
  type: "habit.view";
  title: string;
  items: HabitItem[];
};

type UnsupportedBlock = {
  id?: string;
  type?: unknown;
};

export type PageBlock = MarkdownBlock | TaskViewBlock | CalendarViewBlock | HabitViewBlock;

export type PageSpec = {
  version: 1;
  title: string;
  description?: string;
  blocks: PageBlock[];
  limitations?: string[];
};

export type ValidationResult =
  | { ok: true; spec: PageSpec }
  | { ok: false; message: string };

export type ActionExecutor = (args: Record<string, unknown>) => Promise<unknown>;

type ParseBlockResult = { ok: true; block: PageBlock } | { ok: false; message: string };

type ParseActionResult =
  | { ok: true; action: SafeAction }
  | { ok: false; message: string };

export const prototypeLimitations = [
  "Prototype-only renderer: it covers a small registry, not arbitrary layouts.",
  "Markdown is intentionally minimal and escapes raw HTML.",
  "Actions are restricted to an allowlisted Convex mutation map.",
  "Demo browser actions persist locally so reload proof does not require a live user session.",
];

export const demoPageSpec: PageSpec = {
  version: 1,
  title: "JSON Renderer Prototype",
  description:
    "A bounded prototype for rendering Tempo page variants from Markdown and JSON specs.",
  limitations: prototypeLimitations,
  blocks: [
    {
      id: "intro",
      type: "markdown",
      markdown:
        "## Today bridge\n- Render flexible Markdown safely.\n- Keep structured planner blocks typed.\n- Route buttons through an explicit Convex action allowlist.",
    },
    {
      id: "tasks",
      type: "task.view",
      title: "Task view",
      items: [
        {
          id: "demo-task-1",
          title: "Pay rent",
          description: "A concrete next step that can be marked complete.",
          status: "todo",
          priority: "high",
          action: {
            type: "convex.mutation",
            mutation: "tasks.toggleCompletion",
            args: { taskId: "demo-task-1" },
          },
        },
        {
          id: "demo-task-2",
          title: "Send the tiny update",
          status: "in_progress",
          priority: "medium",
        },
      ],
    },
    {
      id: "calendar",
      type: "calendar.view",
      title: "Calendar view",
      items: [
        {
          id: "event-1",
          title: "Planning reset",
          startsAtLabel: "Today, 4:00 PM",
          durationLabel: "25 min",
          tone: "focus",
        },
        {
          id: "event-2",
          title: "Gentle shutdown",
          startsAtLabel: "Today, 6:30 PM",
          durationLabel: "10 min",
          tone: "calm",
        },
      ],
    },
    {
      id: "habits",
      type: "habit.view",
      title: "Habit view",
      items: [
        {
          id: "demo-habit-1",
          name: "Drink water",
          cadence: "daily",
          currentStreak: 3,
          action: {
            type: "convex.mutation",
            mutation: "habits.completeToday",
            args: { habitId: "demo-habit-1" },
          },
        },
      ],
    },
  ],
};

export function validatePageSpec(input: unknown): ValidationResult {
  if (!isPlainObject(input)) {
    return { ok: false, message: "Spec must be a JSON object." };
  }
  if (input.version !== 1) {
    return { ok: false, message: "Spec version is not supported." };
  }
  if (!isNonEmptyString(input.title)) {
    return { ok: false, message: "Spec title is required." };
  }
  if (!Array.isArray(input.blocks)) {
    return { ok: false, message: "Spec blocks must be an array." };
  }

  const blocks: PageBlock[] = [];
  for (const block of input.blocks) {
    const parsed = parseBlock(block);
    if (!parsed.ok) {
      return parsed;
    }
    blocks.push(parsed.block);
  }

  return {
    ok: true,
    spec: {
      version: 1,
      title: input.title,
      description: typeof input.description === "string" ? input.description : undefined,
      limitations: parseStringArray(input.limitations),
      blocks,
    },
  };
}

export function createSafeActionDispatcher(
  handlers: Partial<Record<SafeMutationName, ActionExecutor>>,
) {
  return async function dispatch(action: SafeAction): Promise<unknown> {
    if (action.type !== "convex.mutation") {
      throw new Error("Only Convex mutation actions are supported.");
    }
    if (!isSafeMutationName(action.mutation)) {
      throw new Error("Action is not allowlisted for this prototype.");
    }
    const handler = handlers[action.mutation];
    if (!handler) {
      throw new Error(`No handler registered for ${action.mutation}.`);
    }
    return await handler(action.args);
  };
}

export function renderPageSpecToHtml(input: unknown): string {
  const result = validatePageSpec(input);
  if (!result.ok) {
    return renderInvalidSpecToHtml(result.message);
  }
  const description = result.spec.description
    ? `<p>${escapeHtml(result.spec.description)}</p>`
    : "";
  const blocks = result.spec.blocks.map(renderBlockToHtml).join("");
  const limitations = result.spec.limitations?.length
    ? `<section><h2>Prototype limitations</h2><ul>${result.spec.limitations
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul></section>`
    : "";

  return `<article><header><h1>${escapeHtml(result.spec.title)}</h1>${description}</header>${blocks}${limitations}</article>`;
}

export function PageSpecRenderer({
  spec,
  onAction,
}: {
  spec: unknown;
  onAction: (action: SafeAction) => Promise<void>;
}) {
  const result = validatePageSpec(spec);

  if (!result.ok) {
    return <InvalidSpec message={result.message} />;
  }

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Page spec prototype
        </p>
        <h1 className="font-heading text-4xl font-semibold text-foreground">
          {result.spec.title}
        </h1>
        {result.spec.description ? (
          <p className="max-w-3xl text-muted-foreground">{result.spec.description}</p>
        ) : null}
      </header>

      <div className="grid gap-5">
        {result.spec.blocks.map((block) => (
          <RendererBlock key={block.id} block={block} onAction={onAction} />
        ))}
      </div>

      {result.spec.limitations?.length ? (
        <section className="rounded-3xl border border-dashed border-border bg-muted/25 p-5">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Prototype limitations
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {result.spec.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

function RendererBlock({
  block,
  onAction,
}: {
  block: PageBlock;
  onAction: (action: SafeAction) => Promise<void>;
}) {
  switch (block.type) {
    case "markdown":
      return <MarkdownBlockView block={block} />;
    case "task.view":
      return <TaskView block={block} onAction={onAction} />;
    case "calendar.view":
      return <CalendarView block={block} />;
    case "habit.view":
      return <HabitView block={block} onAction={onAction} />;
  }
}

function MarkdownBlockView({ block }: { block: MarkdownBlock }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-3 text-foreground">{renderMarkdownReact(block.markdown)}</div>
    </section>
  );
}

function TaskView({
  block,
  onAction,
}: {
  block: TaskViewBlock;
  onAction: (action: SafeAction) => Promise<void>;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-heading text-2xl font-semibold text-foreground">{block.title}</h2>
      <ul className="mt-4 space-y-3">
        {block.items.map((task) => {
          const isDone = task.status === "done";
          const action = task.action;
          return (
            <li
              key={task.id}
              className="rounded-2xl border border-border/80 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    data-testid={`${task.id}-title`}
                    className={isDone ? "font-medium text-muted-foreground line-through" : "font-medium text-foreground"}
                  >
                    {task.title}
                  </p>
                  {task.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {task.priority} priority · {task.status.replace("_", " ")}
                  </p>
                </div>
                {action ? (
                  <button
                    type="button"
                    className="min-h-10 rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => void onAction(action)}
                  >
                    {isDone ? `Reopen ${task.title}` : `Mark ${task.title} complete`}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CalendarView({ block }: { block: CalendarViewBlock }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-heading text-2xl font-semibold text-foreground">{block.title}</h2>
      <ol className="mt-4 space-y-3">
        {block.items.map((event) => (
          <li key={event.id} className="rounded-2xl border border-border/80 bg-background/70 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {event.startsAtLabel}
              {event.durationLabel ? ` · ${event.durationLabel}` : ""}
            </p>
            <p className="mt-1 font-medium text-foreground">{event.title}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function HabitView({
  block,
  onAction,
}: {
  block: HabitViewBlock;
  onAction: (action: SafeAction) => Promise<void>;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-heading text-2xl font-semibold text-foreground">{block.title}</h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {block.items.map((habit) => (
          <HabitListItem key={habit.id} habit={habit} onAction={onAction} />
        ))}
      </ul>
    </section>
  );
}

function HabitListItem({
  habit,
  onAction,
}: {
  habit: HabitItem;
  onAction: (action: SafeAction) => Promise<void>;
}) {
  const action = habit.action;

  return (
    <li className="rounded-2xl border border-border/80 bg-background/70 p-4">
      <p data-testid={`${habit.id}-title`} className="font-medium text-foreground">
        {habit.name}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {habit.cadence} · {habit.currentStreak} calm check-ins
      </p>
      {action ? (
        <button
          type="button"
          className="mt-3 min-h-10 rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => void onAction(action)}
        >
          Log {habit.name}
        </button>
      ) : null}
    </li>
  );
}

function InvalidSpec({ message }: { message: string }) {
  return (
    <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-foreground">
      <h1 className="font-heading text-2xl font-semibold">
        We could not render this page spec safely.
      </h1>
      <p className="mt-3 text-muted-foreground">{message}</p>
      <p className="mt-3 text-sm text-muted-foreground">
        Nothing was executed. Check the spec shape, then try again.
      </p>
    </section>
  );
}

function renderInvalidSpecToHtml(message: string): string {
  return `<section><h1>We could not render this page spec safely.</h1><p>${escapeHtml(message)}</p><p>Nothing was executed. Check the spec shape, then try again.</p></section>`;
}

function renderBlockToHtml(block: PageBlock): string {
  switch (block.type) {
    case "markdown":
      return `<section>${renderMarkdownToHtml(block.markdown)}</section>`;
    case "task.view":
      return `<section><h2>${escapeHtml(block.title)}</h2><ul>${block.items
        .map(
          (task) =>
            `<li><p${task.status === "done" ? ' class="line-through"' : ""}>${escapeHtml(task.title)}</p>${task.description ? `<p>${escapeHtml(task.description)}</p>` : ""}<p>${escapeHtml(task.priority)} priority · ${escapeHtml(task.status.replace("_", " "))}</p></li>`,
        )
        .join("")}</ul></section>`;
    case "calendar.view":
      return `<section><h2>${escapeHtml(block.title)}</h2><ol>${block.items
        .map(
          (event) =>
            `<li><p>${escapeHtml(event.startsAtLabel)}${event.durationLabel ? ` · ${escapeHtml(event.durationLabel)}` : ""}</p><p>${escapeHtml(event.title)}</p></li>`,
        )
        .join("")}</ol></section>`;
    case "habit.view":
      return `<section><h2>${escapeHtml(block.title)}</h2><ul>${block.items
        .map(
          (habit) =>
            `<li><p>${escapeHtml(habit.name)}</p><p>${escapeHtml(habit.cadence)} · ${habit.currentStreak} calm check-ins</p></li>`,
        )
        .join("")}</ul></section>`;
  }
}

function renderMarkdownReact(markdown: string): ReactNode[] {
  return markdown
    .split(/\r?\n/)
    .map((line, index) => renderMarkdownLineReact(line, `${index}-${line}`));
}

function renderMarkdownLineReact(line: string, key: string): ReactNode {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith("## ")) {
    return (
      <h2 key={key} className="font-heading text-2xl font-semibold">
        {trimmed.slice(3)}
      </h2>
    );
  }
  if (trimmed.startsWith("- ")) {
    return (
      <p key={key} className="pl-4 text-muted-foreground before:mr-2 before:content-['•']">
        {renderInlineMarkdownReact(trimmed.slice(2))}
      </p>
    );
  }
  return <p key={key}>{renderInlineMarkdownReact(trimmed)}</p>;
}

function renderInlineMarkdownReact(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMarkdownToHtml(markdown: string): string {
  return markdown
    .split(/\r?\n/)
    .map((line) => renderMarkdownLineToHtml(line))
    .join("");
}

function renderMarkdownLineToHtml(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("## ")) {
    return `<h2>${escapeHtml(trimmed.slice(3))}</h2>`;
  }
  if (trimmed.startsWith("- ")) {
    return `<p>• ${renderInlineMarkdownToHtml(trimmed.slice(2))}</p>`;
  }
  return `<p>${renderInlineMarkdownToHtml(trimmed)}</p>`;
}

function renderInlineMarkdownToHtml(text: string): string {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }
      return escapeHtml(part);
    })
    .join("");
}

function parseBlock(block: unknown): ParseBlockResult {
  if (!isPlainObject(block) || !isNonEmptyString(block.id) || !isNonEmptyString(block.type)) {
    return { ok: false, message: "Each block needs an id and supported type." };
  }

  switch (block.type) {
    case "markdown":
      return parseMarkdownBlock(block);
    case "task.view":
      return parseTaskViewBlock(block);
    case "calendar.view":
      return parseCalendarViewBlock(block);
    case "habit.view":
      return parseHabitViewBlock(block);
    default:
      return { ok: false, message: "Spec includes an unsupported block type." };
  }
}

function parseMarkdownBlock(block: Record<string, unknown>): ParseBlockResult {
  if (!isNonEmptyString(block.markdown)) {
    return { ok: false, message: "Markdown blocks need markdown content." };
  }
  return { ok: true, block: { id: block.id as string, type: "markdown", markdown: block.markdown } };
}

function parseTaskViewBlock(block: Record<string, unknown>): ParseBlockResult {
  if (!isNonEmptyString(block.title) || !Array.isArray(block.items)) {
    return { ok: false, message: "Task views need a title and items." };
  }
  const items: TaskItem[] = [];
  for (const item of block.items) {
    if (!isPlainObject(item) || !isNonEmptyString(item.id) || !isNonEmptyString(item.title)) {
      return { ok: false, message: "Task items need id and title." };
    }
    if (!isTaskStatus(item.status) || !isPriority(item.priority)) {
      return { ok: false, message: "Task items need supported status and priority values." };
    }
    const action = parseAction(item.action);
    if (action !== undefined && !action.ok) {
      return action;
    }
    items.push({
      id: item.id,
      title: item.title,
      status: item.status,
      priority: item.priority,
      description: typeof item.description === "string" ? item.description : undefined,
      action: action?.action,
    });
  }
  return { ok: true, block: { id: block.id as string, type: "task.view", title: block.title, items } };
}

function parseCalendarViewBlock(block: Record<string, unknown>): ParseBlockResult {
  if (!isNonEmptyString(block.title) || !Array.isArray(block.items)) {
    return { ok: false, message: "Calendar views need a title and items." };
  }
  const items: CalendarItem[] = [];
  for (const item of block.items) {
    if (
      !isPlainObject(item) ||
      !isNonEmptyString(item.id) ||
      !isNonEmptyString(item.title) ||
      !isNonEmptyString(item.startsAtLabel)
    ) {
      return { ok: false, message: "Calendar items need id, title, and startsAtLabel." };
    }
    items.push({
      id: item.id,
      title: item.title,
      startsAtLabel: item.startsAtLabel,
      durationLabel: typeof item.durationLabel === "string" ? item.durationLabel : undefined,
      tone: isCalendarTone(item.tone) ? item.tone : undefined,
    });
  }
  return { ok: true, block: { id: block.id as string, type: "calendar.view", title: block.title, items } };
}

function parseHabitViewBlock(block: Record<string, unknown>): ParseBlockResult {
  if (!isNonEmptyString(block.title) || !Array.isArray(block.items)) {
    return { ok: false, message: "Habit views need a title and items." };
  }
  const items: HabitItem[] = [];
  for (const item of block.items) {
    if (!isPlainObject(item) || !isNonEmptyString(item.id) || !isNonEmptyString(item.name)) {
      return { ok: false, message: "Habit items need id and name." };
    }
    if (!isCadence(item.cadence) || typeof item.currentStreak !== "number") {
      return { ok: false, message: "Habit items need cadence and currentStreak." };
    }
    const action = parseAction(item.action);
    if (action !== undefined && !action.ok) {
      return action;
    }
    items.push({
      id: item.id,
      name: item.name,
      cadence: item.cadence,
      currentStreak: item.currentStreak,
      action: action?.action,
    });
  }
  return { ok: true, block: { id: block.id as string, type: "habit.view", title: block.title, items } };
}

function parseAction(input: unknown): ParseActionResult | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (!isPlainObject(input) || input.type !== "convex.mutation") {
    return { ok: false, message: "Actions must use the Convex mutation action shape." };
  }
  if (!isNonEmptyString(input.mutation) || !isSafeMutationName(input.mutation)) {
    return { ok: false, message: "Action mutation is not allowlisted." };
  }
  if (!isPlainObject(input.args)) {
    return { ok: false, message: "Action args must be a JSON object." };
  }
  return {
    ok: true,
    action: {
      type: "convex.mutation",
      mutation: input.mutation,
      args: input.args,
    },
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isTaskStatus(value: unknown): value is TaskItem["status"] {
  return value === "todo" || value === "in_progress" || value === "done" || value === "cancelled";
}

function isPriority(value: unknown): value is TaskItem["priority"] {
  return value === "low" || value === "medium" || value === "high";
}

function isCalendarTone(value: unknown): value is CalendarItem["tone"] {
  return value === "calm" || value === "focus" || value === "soft";
}

function isCadence(value: unknown): value is HabitItem["cadence"] {
  return value === "daily" || value === "weekly";
}

function isSafeMutationName(value: string): value is SafeMutationName {
  return safeMutationNames.includes(value as SafeMutationName);
}

function parseStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

export type { UnsupportedBlock };
