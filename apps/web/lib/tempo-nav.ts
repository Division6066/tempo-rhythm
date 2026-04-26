/**
 * Tempo Flow navigation map — single source of truth for Sidebar, Topbar,
 * responsive mobile web nav, and the Cmd/Ctrl+K screen picker.
 *
 * @source docs/design/claude-export/design-system/app.html (SCREENS object)
 * @source docs/design/claude-export/design-system/components.jsx (NAV)
 * @source docs/design/screen-inventory.md
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
  /** Short copy used by the command palette and navigation docs. */
  summary: string;
  /** Search helpers for the screen picker. No telemetry is recorded. */
  keywords?: readonly string[];
  /** Sidebar/mobile label when it needs to be shorter than the page title. */
  navLabel?: string;
  /** Renders without sidebar/topbar (auth, onboarding, template builder/run, daily-note focus). */
  bare?: boolean;
  /** Hide from primary sidebar while still allowing palette lookup. */
  showInSidebar?: boolean;
  /** Hide from Cmd/Ctrl+K while keeping metadata for route matching. */
  showInPalette?: boolean;
  /** Include in mobile web / Expo primary tab metadata. */
  mobileTab?: boolean;
  /** Optional icon name from @tempo/ui/icons. */
  icon?: string;
};

export const TEMPO_SCREENS: readonly TempoScreen[] = [
  // ---- Flow ----------------------------------------------------------------
  {
    slug: "today",
    title: "Today",
    route: "/today",
    category: "Flow",
    summary: "Daily command center with plan, check-ins, and quick capture.",
    keywords: ["dashboard", "home", "daily", "plan"],
    mobileTab: true,
    icon: "Home",
  },
  {
    slug: "daily-note",
    title: "Daily note",
    route: "/daily-note",
    category: "Flow",
    summary: "Focused daily note surface rendered without the full shell.",
    keywords: ["noteplan", "markdown", "day"],
    bare: true,
    icon: "Notebook",
  },
  {
    slug: "brain-dump",
    title: "Brain dump",
    route: "/brain-dump",
    category: "Flow",
    summary: "Frictionless capture before the user chooses what to send to AI.",
    keywords: ["capture", "inbox", "ai", "compiler"],
    icon: "Sparkles",
  },
  {
    slug: "coach",
    title: "Coach",
    route: "/coach",
    category: "Flow",
    summary: "Supportive coach conversation and planning entry point.",
    keywords: ["chat", "ai", "ask", "plan"],
    mobileTab: true,
    icon: "Heart",
  },
  {
    slug: "plan",
    title: "Planning",
    route: "/plan",
    category: "Flow",
    summary: "Guided planning flow for turning a rough day into a draft plan.",
    keywords: ["planner", "schedule", "coach"],
    icon: "Layout",
  },

  // ---- Library -------------------------------------------------------------
  {
    slug: "tasks",
    title: "Tasks",
    route: "/tasks",
    category: "Library",
    summary: "Master task list and future task detail entry point.",
    keywords: ["todo", "to-do", "inbox", "complete"],
    mobileTab: true,
    icon: "CheckSquare",
  },
  {
    slug: "notes",
    title: "Notes",
    route: "/notes",
    category: "Library",
    summary: "Notes list and markdown editor home.",
    keywords: ["writing", "wiki", "markdown"],
    icon: "BookOpen",
  },
  {
    slug: "journal",
    title: "Journal",
    route: "/journal",
    category: "Library",
    summary: "Chronological journal feed and reflective prompts.",
    keywords: ["mood", "reflection", "entry"],
    icon: "Book",
  },
  {
    slug: "calendar",
    title: "Calendar",
    route: "/calendar",
    category: "Library",
    summary: "Week, month, and day scheduling home.",
    keywords: ["schedule", "time block", "events"],
    icon: "Calendar",
  },
  {
    slug: "habits",
    title: "Habits",
    route: "/habits",
    category: "Library",
    summary: "Habit check-ins and gentle streak context.",
    keywords: ["routine", "check-in", "streak"],
    icon: "Flame",
  },
  {
    slug: "routines",
    title: "Routines",
    route: "/routines",
    category: "Library",
    summary: "Routine library and guided routine player.",
    keywords: ["steps", "repeat", "ritual"],
    icon: "Repeat",
  },
  {
    slug: "goals",
    title: "Goals",
    route: "/goals",
    category: "Library",
    summary: "Goal list and milestone breakdown home.",
    keywords: ["milestones", "progress", "target"],
    icon: "Target",
  },
  {
    slug: "projects",
    title: "Projects",
    route: "/projects",
    category: "Library",
    summary: "Project list and linked task/note detail surfaces.",
    keywords: ["folders", "work", "timeline"],
    icon: "Folder",
  },
  {
    slug: "folders",
    title: "Folders",
    route: "/folders",
    category: "Library",
    summary: "Organization shell for notes, library items, and templates.",
    keywords: ["organize", "tree", "smart folders"],
    icon: "Folder",
  },
  {
    slug: "library",
    title: "Library",
    route: "/library",
    category: "Library",
    summary: "Typed repository for prompts, recipes, routines, and references.",
    keywords: ["prompts", "recipes", "references", "formats"],
    mobileTab: true,
    icon: "BookOpen",
  },
  {
    slug: "library-item",
    title: "Library item",
    route: "/library/demo",
    category: "Library",
    summary: "Detail scaffold for a typed library item.",
    keywords: ["detail", "reference", "prompt"],
    showInSidebar: false,
    icon: "BookOpen",
  },

  // ---- You -----------------------------------------------------------------
  {
    slug: "analytics",
    title: "Insights",
    route: "/insights",
    category: "You",
    summary: "Energy, completion, and time insight dashboard shell.",
    keywords: ["analytics", "charts", "patterns"],
    icon: "Chart",
  },
  {
    slug: "activity",
    title: "Recent activity",
    route: "/activity",
    category: "You",
    summary: "Timeline shell for recent changes and check-ins.",
    keywords: ["history", "feed", "timeline"],
    icon: "Clock",
  },
  {
    slug: "templates",
    title: "Templates",
    route: "/templates",
    category: "You",
    summary: "Template gallery and creation hub.",
    keywords: ["daily", "weekly", "builder", "starter"],
    icon: "Layers",
  },
  {
    slug: "rewards",
    title: "Rewards",
    route: "/rewards",
    category: "You",
    summary: "Reward system shell centered on effort, not pressure.",
    keywords: ["xp", "treats", "motivation"],
    icon: "Trophy",
  },
  {
    slug: "search",
    title: "Search",
    route: "/search",
    category: "You",
    summary: "Global search shell across tasks, notes, and library items.",
    keywords: ["find", "lookup", "filter"],
    icon: "Search",
  },
  {
    slug: "command",
    title: "Command bar",
    route: "/command",
    category: "You",
    summary: "Keyboard-first navigation shell and future command surface.",
    keywords: ["cmd-k", "ctrl-k", "palette", "jump"],
    showInSidebar: false,
    icon: "Command",
  },
  {
    slug: "empty-states",
    title: "Empty states",
    route: "/empty-states",
    category: "You",
    summary: "Gallery of shame-proof empty state patterns.",
    keywords: ["copy", "system", "gallery"],
    showInSidebar: false,
    icon: "Leaf",
  },

  // ---- Settings ------------------------------------------------------------
  {
    slug: "settings",
    title: "Profile",
    navLabel: "Profile",
    route: "/settings/profile",
    category: "Settings",
    summary: "Profile settings shell.",
    keywords: ["account", "user"],
    icon: "User",
  },
  {
    slug: "settings-prefs",
    title: "Preferences",
    navLabel: "Preferences",
    route: "/settings/preferences",
    category: "Settings",
    summary: "Theme, accessibility, language, and motion preferences.",
    keywords: ["accessibility", "theme", "dyslexia", "motion"],
    mobileTab: true,
    icon: "Settings",
  },
  {
    slug: "settings-integrations",
    title: "Integrations",
    navLabel: "Integrations",
    route: "/settings/integrations",
    category: "Settings",
    summary: "Integration settings shell for future connected services.",
    keywords: ["sync", "calendar", "connected"],
    icon: "Link",
  },
  {
    slug: "billing",
    title: "Trial & billing",
    route: "/billing",
    category: "Settings",
    summary: "Billing route scaffold; provider behavior is out of shell scope.",
    keywords: ["trial", "plan", "subscription"],
    icon: "Star",
  },
  {
    slug: "notifications",
    title: "Notifications",
    route: "/notifications",
    category: "Settings",
    summary: "Notification preference scaffold.",
    keywords: ["reminders", "alerts", "nudges"],
    icon: "Bell",
  },
  {
    slug: "ask-founder",
    title: "Ask the founder",
    route: "/ask-founder",
    category: "Settings",
    summary: "Founder feedback route where the user chooses what to send.",
    keywords: ["feedback", "amit", "support", "message"],
    icon: "Mail",
  },

  // ---- Bare routes (no shell) ---------------------------------------------
  {
    slug: "sign-in",
    title: "Sign in",
    route: "/sign-in",
    category: "Onboarding",
    summary: "Authentication entry point.",
    bare: true,
  },
  {
    slug: "onboarding",
    title: "Onboarding",
    route: "/onboarding",
    category: "Onboarding",
    summary: "First-run onboarding flow.",
    bare: true,
  },
  {
    slug: "template-builder",
    title: "Template builder",
    route: "/templates/builder",
    category: "You",
    summary: "Focused template builder surface rendered outside the shell.",
    bare: true,
  },
  {
    slug: "template-run",
    title: "Template run",
    route: "/templates/run",
    category: "You",
    summary: "Guided template run surface rendered outside the shell.",
    bare: true,
  },
  {
    slug: "trial-end",
    title: "Trial ended",
    route: "/billing/trial-end",
    category: "Settings",
    summary: "Trial-ended route scaffold.",
    bare: true,
  },

  // ---- Marketing (bare: own layout) ---------------------------------------
  {
    slug: "landing",
    title: "Landing",
    route: "/",
    category: "Marketing",
    summary: "Public landing page.",
    bare: true,
    showInPalette: false,
  },
  {
    slug: "about",
    title: "About",
    route: "/about",
    category: "Marketing",
    summary: "Public about page.",
    bare: true,
    showInPalette: false,
  },
  {
    slug: "changelog",
    title: "Changelog",
    route: "/changelog",
    category: "Marketing",
    summary: "Public changelog page.",
    bare: true,
    showInPalette: false,
  },
];

export const CATEGORIES: readonly TempoCategory[] = [
  "Flow",
  "Library",
  "You",
  "Settings",
];

const routeSpecificity = (screen: TempoScreen) => screen.route.length;

export function screenLabel(screen: TempoScreen): string {
  return screen.navLabel ?? screen.title;
}

export function screensByCategory(category: TempoCategory): TempoScreen[] {
  return sidebarScreensByCategory(category);
}

export function sidebarScreensByCategory(
  category: TempoCategory,
): TempoScreen[] {
  return TEMPO_SCREENS.filter(
    (screen) =>
      screen.category === category &&
      !screen.bare &&
      screen.showInSidebar !== false,
  );
}

export function commandPaletteScreens(): TempoScreen[] {
  return TEMPO_SCREENS.filter(
    (screen) => !screen.bare && screen.showInPalette !== false,
  );
}

export function primaryMobileTabs(): TempoScreen[] {
  return TEMPO_SCREENS.filter((screen) => screen.mobileTab === true);
}

export function findScreen(slug: string): TempoScreen | undefined {
  return TEMPO_SCREENS.find((screen) => screen.slug === slug);
}

export function isRouteActive(pathname: string, route: string): boolean {
  if (route === "/") {
    return pathname === "/";
  }

  return pathname === route || pathname.startsWith(`${route}/`);
}

export function findScreenByPathname(
  pathname: string | null | undefined,
): TempoScreen | undefined {
  if (!pathname) {
    return findScreen("today");
  }

  return [...TEMPO_SCREENS]
    .sort((a, b) => routeSpecificity(b) - routeSpecificity(a))
    .find((screen) => isRouteActive(pathname, screen.route));
}

export function screenSearchText(screen: TempoScreen): string {
  return [
    screen.title,
    screen.navLabel,
    screen.slug,
    screen.route,
    screen.category,
    screen.summary,
    ...(screen.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
