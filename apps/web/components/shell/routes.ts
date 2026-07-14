export type ShellRoute = {
  href: string;
  label: string;
  heading: string;
  description: string;
};

export const shellRoutes = [
  {
    href: "/",
    label: "Home",
    heading: "Agentwright Mission Control",
    description: "A quiet launchpad for the universal Agentwright web shell.",
  },
  {
    href: "/sessions",
    label: "Sessions",
    heading: "Sessions",
    description: "Placeholder for run history, live sessions, and follow-up context.",
  },
  {
    href: "/sessions/demo-session",
    label: "Session detail",
    heading: "Session detail",
    description: "Placeholder for one session transcript, artifacts, and execution state.",
  },
  {
    href: "/sessions/demo-session/diff",
    label: "Session diff",
    heading: "Session diff",
    description: "Placeholder for reviewing code, docs, and generated artifact changes.",
  },
  {
    href: "/agents",
    label: "Agents",
    heading: "Agents",
    description: "Placeholder for agent profiles, capabilities, and current availability.",
  },
  {
    href: "/tickets",
    label: "Tickets",
    heading: "Tickets",
    description: "Placeholder for planned work, issue intake, and execution queues.",
  },
  {
    href: "/approvals",
    label: "Approvals",
    heading: "Approvals",
    description: "Placeholder for confirm, edit, reject, and undo review cards.",
  },
  {
    href: "/vault",
    label: "Vault",
    heading: "Vault",
    description: "Placeholder for private materials that should stay deliberately gated.",
  },
  {
    href: "/skills",
    label: "Skills",
    heading: "Skills",
    description: "Placeholder for reusable operating procedures and execution playbooks.",
  },
  {
    href: "/usage",
    label: "Usage",
    heading: "Usage",
    description: "Placeholder for spend, runtime, and quota visibility.",
  },
  {
    href: "/trash",
    label: "Trash",
    heading: "Trash",
    description: "Placeholder for recoverable deleted work and cleanup decisions.",
  },
  {
    href: "/settings",
    label: "Settings",
    heading: "Settings",
    description: "Placeholder for account, accessibility, and workspace preferences.",
  },
] as const satisfies readonly ShellRoute[];

export function getShellRoute(href: string): ShellRoute {
  const route = shellRoutes.find((candidate) => candidate.href === href);
  if (!route) {
    throw new Error(`Missing shell route metadata for ${href}`);
  }

  return route;
}
