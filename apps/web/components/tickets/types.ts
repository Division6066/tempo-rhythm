export type TicketState = "backlog" | "ready" | "in_progress" | "review" | "done";

export type TicketEvidence = {
  id: string;
  command: string;
  exitCode: number;
  note: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  title: string;
  summary: string;
  state: TicketState;
  owner: string;
  dependsOn: string[];
  evidence: TicketEvidence[];
};

export type TicketBoardData = {
  projectName: string;
  tickets: Ticket[];
};
