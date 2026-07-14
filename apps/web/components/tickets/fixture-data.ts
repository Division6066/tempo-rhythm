import type { TicketBoardData } from "./types";

export const aw34FixtureData: TicketBoardData = {
  projectName: "Agentwright",
  tickets: [
    {
      id: "AW-34",
      title: "Ticket board UI: kanban + evidence log",
      summary: "Linear-style ticket board with dependency context and a full evidence trail.",
      state: "in_progress",
      owner: "cursor",
      dependsOn: ["AW-03", "AW-32"],
      evidence: [
        {
          id: "ev-aw34-install",
          command: "bun install",
          exitCode: 0,
          note: "Workspace dependencies installed before the UI run.",
          createdAt: "2026-07-14 15:23 UTC",
        },
        {
          id: "ev-aw34-red",
          command: "bunx playwright test apps/web/e2e/tickets.spec.ts",
          exitCode: 1,
          note: "Red run confirmed the missing ticket route before implementation.",
          createdAt: "2026-07-14 15:25 UTC",
        },
      ],
    },
    {
      id: "AW-03",
      title: "Ticket query contract",
      summary: "Expose ticket list and detail reads for the board.",
      state: "done",
      owner: "cursor",
      dependsOn: [],
      evidence: [],
    },
    {
      id: "AW-32",
      title: "Evidence event stream",
      summary: "Record command outcomes as ticket events.",
      state: "review",
      owner: "cursor",
      dependsOn: ["AW-03"],
      evidence: [],
    },
    {
      id: "AW-31",
      title: "Intent intake endpoint",
      summary: "Accept one raw intent and turn it into a proposed ticket.",
      state: "ready",
      owner: "cursor",
      dependsOn: ["AW-03"],
      evidence: [],
    },
    {
      id: "AW-29",
      title: "Project selector shell",
      summary: "Let users switch between agent projects without losing context.",
      state: "backlog",
      owner: "cursor",
      dependsOn: [],
      evidence: [],
    },
    {
      id: "AW-30",
      title: "Board empty states",
      summary: "Show calm guidance when a project has no tickets yet.",
      state: "backlog",
      owner: "cursor",
      dependsOn: [],
      evidence: [],
    },
  ],
};

export const emptyTicketBoardData: TicketBoardData = {
  projectName: "Empty project",
  tickets: [],
};
