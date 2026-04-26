/**
 * Tempo Flow navigation map — single source of truth for Sidebar + ⌘K palette.
 *
 * @source docs/design/claude-export/design-system/app.html (SCREENS object L60-L109)
 * @source docs/design/implementation-matrix/screens.json (canonical, machine-readable)
 *
 * Update rule: every new route must add an entry here AND in
 * `docs/design/implementation-matrix/screens.json`. The two are kept in sync
 * by hand for now; a regen script will arrive in the Phase 1 shell PR
 * (see docs/design/implementation-matrix/agent-checklists/claude-shell.md).
 */

export type TempoCategory =
  | "Flow"
  | "Library"
  | "You"
  | "Settings"
  | "Marketing"
  | "Onboarding"
  | "Mobile";

export type TempoScreen = {
  slug: string;
  title: string;
  route: string;
  category: TempoCategory;
  /** Renders without sidebar/topbar (auth, onboarding, template builder/run, daily-note focus). */
  bare?: boolean;
  /** True when the route contains a Next dynamic segment (`[id]`); excluded from sidebar + ⌘K by default. */
  dynamic?: boolean;
  /** Tagged deprecated; kept for backward compat but excluded from sidebar + ⌘K. */
  deprecated?: boolean;
  /** Optional icon name from @tempo/ui/icons. */
  icon?: string;
};

export const TEMPO_SCREENS: readonly TempoScreen[] = [
  // ---- Flow ----------------------------------------------------------------
  { slug: "today", title: "Today", route: "/today", category: "Flow", icon: "Home" },
  {
    slug: "daily-note",
    title: "Daily note",
    route: "/daily-note",
    category: "Flow",
    bare: true,
    icon: "Notebook",
  },
  {
    slug: "brain-dump",
    title: "Brain dump",
    route: "/brain-dump",
    category: "Flow",
    icon: "Sparkles",
  },
  { slug: "coach", title: "Coach", route: "/coach", category: "Flow", icon: "Heart" },
  { slug: "plan", title: "Planning", route: "/plan", category: "Flow", icon: "Layout" },

  // ---- Library -------------------------------------------------------------
  { slug: "tasks", title: "Tasks", route: "/tasks", category: "Library", icon: "CheckSquare" },
  { slug: "notes", title: "Notes", route: "/notes", category: "Library", icon: "BookOpen" },
  {
    slug: "note-detail",
    title: "Note · editor",
    route: "/notes/[id]",
    category: "Library",
    dynamic: true,
    icon: "Edit",
  },
  { slug: "journal", title: "Journal", route: "/journal", category: "Library", icon: "Book" },
  {
    slug: "calendar",
    title: "Calendar",
    route: "/calendar",
    category: "Library",
    icon: "Calendar",
  },
  { slug: "habits", title: "Habits", route: "/habits", category: "Library", icon: "Flame" },
  {
    slug: "habit-detail",
    title: "Habit detail",
    route: "/habits/[id]",
    category: "Library",
    dynamic: true,
    icon: "Flame",
  },
  { slug: "routines", title: "Routines", route: "/routines", category: "Library", icon: "Repeat" },
  {
    slug: "routine-detail",
    title: "Routine · guided",
    route: "/routines/[id]",
    category: "Library",
    dynamic: true,
    icon: "Repeat",
  },
  { slug: "goals", title: "Goals", route: "/goals", category: "Library", icon: "Target" },
  {
    slug: "goal-detail",
    title: "Goal detail",
    route: "/goals/[id]",
    category: "Library",
    dynamic: true,
    icon: "Target",
  },
  {
    slug: "goals-progress",
    title: "Goals · chart",
    route: "/goals/progress",
    category: "Library",
    icon: "Chart",
  },
  { slug: "projects", title: "Projects", route: "/projects", category: "Library", icon: "Folder" },
  {
    slug: "project-detail",
    title: "Project detail",
    route: "/projects/[id]",
    category: "Library",
    dynamic: true,
    icon: "Folder",
  },
  {
    slug: "project-kanban",
    title: "Project · kanban",
    route: "/projects/[id]/kanban",
    category: "Library",
    dynamic: true,
    icon: "Layout",
  },

  // ---- You -----------------------------------------------------------------
  { slug: "analytics", title: "Insights", route: "/insights", category: "You", icon: "Chart" },
  {
    slug: "activity",
    title: "Recent activity",
    route: "/activity",
    category: "You",
    icon: "Clock",
  },
  { slug: "templates", title: "Templates", route: "/templates", category: "You", icon: "Layers" },
  { slug: "search", title: "Search", route: "/search", category: "You", icon: "Search" },
  { slug: "command", title: "Command bar", route: "/command", category: "You", icon: "Command" },
  {
    slug: "empty-states",
    title: "Empty states",
    route: "/empty-states",
    category: "You",
    icon: "Leaf",
  },

  // ---- Settings ------------------------------------------------------------
  {
    slug: "settings",
    title: "Profile",
    route: "/settings/profile",
    category: "Settings",
    icon: "User",
  },
  {
    slug: "settings-prefs",
    title: "Preferences",
    route: "/settings/preferences",
    category: "Settings",
    icon: "Settings",
  },
  {
    slug: "settings-integrations",
    title: "Integrations",
    route: "/settings/integrations",
    category: "Settings",
    icon: "Link",
  },
  {
    slug: "billing",
    title: "Trial & billing",
    route: "/billing",
    category: "Settings",
    icon: "Star",
  },
  {
    slug: "notifications",
    title: "Notifications",
    route: "/notifications",
    category: "Settings",
    icon: "Bell",
  },
  {
    slug: "ask-founder",
    title: "Ask the founder",
    route: "/ask-founder",
    category: "Settings",
    icon: "Mail",
  },

  // ---- Bare routes (no shell) ---------------------------------------------
  { slug: "sign-in", title: "Sign in", route: "/sign-in", category: "Onboarding", bare: true },
  {
    slug: "onboarding",
    title: "Onboarding",
    route: "/onboarding",
    category: "Onboarding",
    bare: true,
  },
  {
    slug: "template-builder",
    title: "Template builder",
    route: "/templates/builder",
    category: "You",
    bare: true,
  },
  {
    slug: "template-run",
    title: "Template run",
    route: "/templates/run/[id]",
    category: "You",
    bare: true,
    dynamic: true,
  },
  {
    slug: "trial-end",
    title: "Trial ended",
    route: "/billing/trial-end",
    category: "Settings",
    bare: true,
  },

  // ---- Legacy / showcase --------------------------------------------------
  {
    slug: "template-editor",
    title: "Template editor (legacy)",
    route: "/templates/editor/[id]",
    category: "You",
    dynamic: true,
    deprecated: true,
    icon: "Edit",
  },
  {
    slug: "template-sketch",
    title: "Template sketch",
    route: "/templates/sketch",
    category: "You",
    deprecated: true,
    icon: "Edit",
  },

  // ---- Marketing (bare: own layout) ---------------------------------------
  { slug: "landing", title: "Landing", route: "/", category: "Marketing", bare: true },
  { slug: "about", title: "About", route: "/about", category: "Marketing", bare: true },
  { slug: "changelog", title: "Changelog", route: "/changelog", category: "Marketing", bare: true },
];

export const CATEGORIES: readonly TempoCategory[] = ["Flow", "Library", "You", "Settings"];

/** Filter returning the screens shown in the desktop sidebar for a given category. */
export function screensByCategory(category: TempoCategory): TempoScreen[] {
  return TEMPO_SCREENS.filter(
    (s) => s.category === category && !s.bare && !s.dynamic && !s.deprecated
  );
}

export function findScreen(slug: string): TempoScreen | undefined {
  return TEMPO_SCREENS.find((s) => s.slug === slug);
}

/** Screens listed in the ⌘K palette (excludes dynamic detail routes + deprecated). */
export function paletteScreens(): TempoScreen[] {
  return TEMPO_SCREENS.filter((s) => !s.dynamic && !s.deprecated);
}
