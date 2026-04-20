import type { MobileScreenFixture, ScreenFixture } from "./types";

function createScreenFixture(definition: Omit<ScreenFixture, "owner" | "tier">): ScreenFixture {
  return {
    ...definition,
    owner: "cursor-cloud-1",
    tier: "A",
  };
}

function createControls(screenId: string): ScreenFixture["controls"] {
  return [
    {
      id: `${screenId}-primary`,
      label: "Primary scaffold action",
      intent: "Primary CTA from design export.",
      tags: [
        {
          type: "@behavior",
          value: "Run the primary flow and reflect results in this scaffold.",
        },
        {
          type: "@convex-mutation-needed",
          value: `${screenId}.primaryMutation`,
        },
        {
          type: "@navigate",
          value: `/${screenId.replace(/-/g, "/")}`,
        },
        {
          type: "@prd",
          value: "PRD §4, §6",
        },
        {
          type: "@source",
          value: "docs/design/claude-export/design-system/screens-*.jsx",
        },
      ],
    },
    {
      id: `${screenId}-secondary`,
      label: "Secondary inspect action",
      intent: "Inspect or refresh scaffold read state.",
      tags: [
        {
          type: "@behavior",
          value: "Refresh read model and keep placeholder state deterministic.",
        },
        {
          type: "@convex-query-needed",
          value: `${screenId}.readModel`,
        },
        {
          type: "@prd",
          value: "PRD §4, §11",
        },
        {
          type: "@source",
          value: "docs/design/claude-export/design-system/screens-*.jsx",
        },
      ],
    },
  ];
}

const WEB_SCREEN_DEFINITIONS: Array<Omit<ScreenFixture, "owner" | "tier">> = [
  {
    id: "daily-note",
    title: "Daily Note",
    category: "Flow",
    route: "/daily-note",
    summary: "Distraction-free daily note capture for planning context.",
    prdRefs: ["§4 Screen 4", "§11"],
    sourceRefs: ["screens-1.jsx"],
    controls: createControls("daily-note"),
  },
  {
    id: "today",
    title: "Today",
    category: "Flow",
    route: "/today",
    summary: "Daily command center with coach guidance and top priorities.",
    prdRefs: ["§4 Screen 1", "§8"],
    sourceRefs: ["screens-1.jsx"],
    controls: createControls("today"),
  },
  {
    id: "brain-dump",
    title: "Brain Dump",
    category: "Flow",
    route: "/brain-dump",
    summary: "Low-friction thought capture and extraction review scaffold.",
    prdRefs: ["§4 Screen 11", "§6"],
    sourceRefs: ["screens-1.jsx"],
    controls: [
      {
        id: "brain-dump-submit",
        label: "Submit dump",
        intent: "Process captured text into proposals.",
        tags: [
          {
            type: "@behavior",
            value: "Process raw dump text into reviewable extracted proposals.",
          },
          {
            type: "@convex-action-needed",
            value: "brainDump.processCapture",
          },
          {
            type: "@provider-needed",
            value: "openrouter",
          },
          {
            type: "@navigate",
            value: "/plan",
          },
          {
            type: "@confirm",
            value: "accept / edit / reject before apply",
          },
          {
            type: "@prd",
            value: "PRD §4 Screen 11, §6.2",
          },
          {
            type: "@source",
            value: "docs/design/claude-export/design-system/screens-1.jsx",
          },
        ],
      },
      {
        id: "brain-dump-list",
        label: "Review previous dumps",
        intent: "List prior captures for context.",
        tags: [
          {
            type: "@behavior",
            value: "Show previous processed dumps with extraction status.",
          },
          {
            type: "@convex-query-needed",
            value: "brainDumps.listRecent",
          },
          {
            type: "@prd",
            value: "PRD §4 Screen 11",
          },
          {
            type: "@source",
            value: "docs/design/claude-export/design-system/screens-1.jsx",
          },
        ],
      },
    ],
  },
  {
    id: "coach",
    title: "Coach",
    category: "Flow",
    route: "/coach",
    summary: "Persistent coach conversation with voice and context controls.",
    prdRefs: ["§4 Screen 12", "§8", "§9"],
    sourceRefs: ["screens-1.jsx", "coach-dock.jsx"],
    controls: [
      {
        id: "coach-send",
        label: "Send message",
        intent: "Post user message and stream assistant reply.",
        tags: [
          {
            type: "@behavior",
            value: "Append user turn then stream coach response into thread.",
          },
          {
            type: "@convex-action-needed",
            value: "coach.sendMessage",
          },
          {
            type: "@provider-needed",
            value: "openrouter",
          },
          {
            type: "@convex-query-needed",
            value: "coach.messagesByConversation",
          },
          {
            type: "@prd",
            value: "PRD §4 Screen 12, §8",
          },
          {
            type: "@source",
            value: "docs/design/claude-export/design-system/coach-dock.jsx",
          },
        ],
      },
      {
        id: "coach-voice",
        label: "Push-to-talk",
        intent: "Transcribe and post spoken message.",
        tags: [
          {
            type: "@behavior",
            value: "Hold to record, release to transcribe, then append transcript.",
          },
          {
            type: "@convex-action-needed",
            value: "voice.transcribePushToTalk",
          },
          {
            type: "@provider-needed",
            value: "openrouter",
          },
          {
            type: "@schema-delta",
            value: "voiceSessions.mode",
          },
          {
            type: "@tier-caps",
            value: "basic 30 min/day; pro 90 min/day; max 180 min/day",
          },
          {
            type: "@prd",
            value: "PRD §9, §15",
          },
          {
            type: "@source",
            value: "docs/design/claude-export/design-system/voice-chat.jsx",
          },
        ],
      },
    ],
  },
  {
    id: "plan",
    title: "Planning",
    category: "Flow",
    route: "/plan",
    summary: "Guided planning flow from intake to committed plan.",
    prdRefs: ["§4 Screen 13", "§6"],
    sourceRefs: ["screens-1.jsx"],
    controls: createControls("plan"),
  },
  {
    id: "tasks",
    title: "Tasks",
    category: "Library",
    route: "/tasks",
    summary: "Filterable and sortable task list with bulk actions.",
    prdRefs: ["§4 Screen 2", "§12"],
    sourceRefs: ["screens-2.jsx"],
    controls: createControls("tasks"),
  },
  {
    id: "notes",
    title: "Notes",
    category: "Library",
    route: "/notes",
    summary: "Notes list with quick capture and filters.",
    prdRefs: ["§4 Screen 4", "§13"],
    sourceRefs: ["screens-2.jsx"],
    controls: createControls("notes"),
  },
  {
    id: "note-detail",
    title: "Note editor",
    category: "Library",
    route: "/notes/[id]",
    summary: "Rich note editor with linked actions and extraction hooks.",
    prdRefs: ["§4 Screen 5", "§7"],
    sourceRefs: ["screens-2.jsx"],
    controls: createControls("note-detail"),
  },
  {
    id: "journal",
    title: "Journal",
    category: "Library",
    route: "/journal",
    summary: "Chronological journal feed with mood prompts.",
    prdRefs: ["§4 Screen 6", "§16"],
    sourceRefs: ["screens-2.jsx"],
    controls: createControls("journal"),
  },
  {
    id: "calendar",
    title: "Calendar",
    category: "Library",
    route: "/calendar",
    summary: "Schedule views for weekly, monthly, and daily planning.",
    prdRefs: ["§4 Screen 8", "§4 Screen 9", "§4 Screen 10"],
    sourceRefs: ["screens-3.jsx"],
    controls: createControls("calendar"),
  },
  {
    id: "habits",
    title: "Habits",
    category: "Library",
    route: "/habits",
    summary: "Habit tracker with streaks and completion controls.",
    prdRefs: ["§4 Screen 14", "§12"],
    sourceRefs: ["screens-3.jsx"],
    controls: createControls("habits"),
  },
  {
    id: "habit-detail",
    title: "Habit detail",
    category: "Library",
    route: "/habits/[id]",
    summary: "Single habit progress and check-in scaffold.",
    prdRefs: ["§4 Screen 14", "§12"],
    sourceRefs: ["screens-3.jsx"],
    controls: createControls("habit-detail"),
  },
  {
    id: "routines",
    title: "Routines",
    category: "Library",
    route: "/routines",
    summary: "Routine library with run-now actions.",
    prdRefs: ["§4 Screen 42", "§13"],
    sourceRefs: ["screens-3.jsx"],
    controls: createControls("routines"),
  },
  {
    id: "routine-detail",
    title: "Routine run",
    category: "Library",
    route: "/routines/[id]",
    summary: "Step-by-step routine execution scaffold.",
    prdRefs: ["§4 Screen 42", "§13"],
    sourceRefs: ["screens-3.jsx"],
    controls: createControls("routine-detail"),
  },
  {
    id: "goals",
    title: "Goals",
    category: "Library",
    route: "/goals",
    summary: "Goal list with progress and decomposition entry points.",
    prdRefs: ["§4 Screen 15", "§7"],
    sourceRefs: ["screens-4.jsx"],
    controls: createControls("goals"),
  },
  {
    id: "goal-detail",
    title: "Goal detail",
    category: "Library",
    route: "/goals/[id]",
    summary: "Milestone-level goal breakdown and linked tasks.",
    prdRefs: ["§4 Screen 15", "§7"],
    sourceRefs: ["screens-4.jsx"],
    controls: createControls("goal-detail"),
  },
  {
    id: "goals-progress",
    title: "Goals progress",
    category: "Library",
    route: "/goals/progress",
    summary: "Progress visualization scaffold for active goals.",
    prdRefs: ["§4 Screen 15", "§17"],
    sourceRefs: ["screens-4.jsx"],
    controls: createControls("goals-progress"),
  },
  {
    id: "projects",
    title: "Projects",
    category: "Library",
    route: "/projects",
    summary: "Project index with status and due date summaries.",
    prdRefs: ["§4 Screen 17", "§12"],
    sourceRefs: ["screens-4.jsx"],
    controls: createControls("projects"),
  },
  {
    id: "project-detail",
    title: "Project detail",
    category: "Library",
    route: "/projects/[id]",
    summary: "Project tabs for tasks, notes, and timeline.",
    prdRefs: ["§4 Screen 18", "§13"],
    sourceRefs: ["screens-4.jsx"],
    controls: createControls("project-detail"),
  },
  {
    id: "project-kanban",
    title: "Project kanban",
    category: "Library",
    route: "/projects/[id]/kanban",
    summary: "Kanban board scaffold for project work streams.",
    prdRefs: ["§4 Screen 18", "§12"],
    sourceRefs: ["screens-4.jsx"],
    controls: createControls("project-kanban"),
  },
  {
    id: "analytics",
    title: "Insights",
    category: "You",
    route: "/insights",
    summary: "User analytics dashboard built on aggregated metrics.",
    prdRefs: ["§4 Screen 43", "§17"],
    sourceRefs: ["screens-5.jsx"],
    controls: createControls("analytics"),
  },
  {
    id: "activity",
    title: "Recent activity",
    category: "You",
    route: "/activity",
    summary: "Chronological activity feed with type filters.",
    prdRefs: ["§4 Screen 44", "§17"],
    sourceRefs: ["screens-5.jsx"],
    controls: createControls("activity"),
  },
  {
    id: "templates",
    title: "Templates",
    category: "You",
    route: "/templates",
    summary: "Template gallery for planning and content scaffolds.",
    prdRefs: ["§4 Screen 22", "§10"],
    sourceRefs: ["screens-templates.jsx"],
    controls: createControls("templates"),
  },
  {
    id: "template-builder",
    title: "Template builder",
    category: "You",
    route: "/templates/builder",
    summary: "Builder flow for natural-language template authoring.",
    prdRefs: ["§4 Screen 23", "§10"],
    sourceRefs: [
      "screens-template-builder.jsx",
      "screens-template-builder-ui.jsx",
      "screens-template-builder-slash.jsx",
    ],
    controls: createControls("template-builder"),
  },
  {
    id: "template-run",
    title: "Template run",
    category: "You",
    route: "/templates/run/[id]",
    summary: "Execution flow for applying template steps.",
    prdRefs: ["§4 Screen 23", "§10"],
    sourceRefs: ["screens-template-run.jsx"],
    controls: createControls("template-run"),
  },
  {
    id: "template-editor",
    title: "Template editor",
    category: "You",
    route: "/templates/editor/[id]",
    summary: "Legacy template editor with section-level controls.",
    prdRefs: ["§4 Screen 23", "§10"],
    sourceRefs: ["screens-5.jsx"],
    controls: createControls("template-editor"),
  },
  {
    id: "template-sketch",
    title: "Template sketch",
    category: "You",
    route: "/templates/sketch",
    summary: "Sketch upload and interpretation scaffold.",
    prdRefs: ["§4 Screen 23", "§10"],
    sourceRefs: ["screens-5.jsx"],
    controls: [
      {
        id: "template-sketch-upload",
        label: "Upload sketch",
        intent: "Interpret visual template draft.",
        tags: [
          {
            type: "@behavior",
            value: "Upload image and parse sketch into editable template structure.",
          },
          {
            type: "@convex-action-needed",
            value: "templates.parseSketch",
          },
          {
            type: "@provider-needed",
            value: "openrouter",
          },
          {
            type: "@prd",
            value: "PRD §10.3",
          },
          {
            type: "@source",
            value: "docs/design/claude-export/design-system/screens-5.jsx",
          },
        ],
      },
      {
        id: "template-sketch-preview",
        label: "Preview generated template",
        intent: "Inspect parsed sections before save.",
        tags: [
          {
            type: "@behavior",
            value: "Display generated structured template and allow edits.",
          },
          {
            type: "@convex-query-needed",
            value: "templates.getDraftPreview",
          },
          {
            type: "@schema-delta",
            value: "templates.sourceImageRef",
          },
          {
            type: "@prd",
            value: "PRD §10.3",
          },
          {
            type: "@source",
            value: "docs/design/claude-export/design-system/screens-5.jsx",
          },
        ],
      },
    ],
  },
  {
    id: "search",
    title: "Search",
    category: "You",
    route: "/search",
    summary: "Global lexical + semantic search scaffold.",
    prdRefs: ["§4 Screen 24", "§11"],
    sourceRefs: ["screens-5.jsx"],
    controls: createControls("search"),
  },
  {
    id: "command",
    title: "Command bar",
    category: "You",
    route: "/command",
    summary: "Command launcher with navigation and action entries.",
    prdRefs: ["§4 Screen 24", "§14"],
    sourceRefs: ["screens-5.jsx"],
    controls: createControls("command"),
  },
  {
    id: "empty-states",
    title: "Empty states",
    category: "You",
    route: "/empty-states",
    summary: "Reference gallery of anti-shame empty state content.",
    prdRefs: ["§1", "§14"],
    sourceRefs: ["screens-6.jsx"],
    controls: createControls("empty-states"),
  },
  {
    id: "settings",
    title: "Settings profile",
    category: "Settings",
    route: "/settings/profile",
    summary: "Settings root and profile preferences scaffold.",
    prdRefs: ["§4 Screen 25", "§4 Screen 26"],
    sourceRefs: ["screens-6.jsx"],
    controls: createControls("settings"),
  },
  {
    id: "settings-prefs",
    title: "Settings preferences",
    category: "Settings",
    route: "/settings/preferences",
    summary: "Preferences for AI, theme, and behavior defaults.",
    prdRefs: ["§4 Screen 32", "§4 Screen 33", "§8"],
    sourceRefs: ["screens-6.jsx"],
    controls: createControls("settings-prefs"),
  },
  {
    id: "settings-integrations",
    title: "Settings integrations",
    category: "Settings",
    route: "/settings/integrations",
    summary: "Integration waitlist and linked account placeholders.",
    prdRefs: ["§4 Screen 29", "§21"],
    sourceRefs: ["screens-6.jsx"],
    controls: createControls("settings-integrations"),
  },
  {
    id: "billing",
    title: "Trial & billing",
    category: "Settings",
    route: "/billing",
    summary: "Plan status and trial lifecycle scaffold.",
    prdRefs: ["§4 Screen 27", "§15"],
    sourceRefs: ["screens-6.jsx"],
    controls: [
      {
        id: "billing-open-portal",
        label: "Manage billing",
        intent: "Open subscription management portal.",
        tags: [
          {
            type: "@behavior",
            value: "Open hosted billing management view with current entitlement context.",
          },
          {
            type: "@convex-action-needed",
            value: "billing.createCustomerPortalSession",
          },
          {
            type: "@provider-needed",
            value: "revenuecat",
          },
          {
            type: "@prd",
            value: "PRD §15",
          },
          {
            type: "@source",
            value: "docs/design/claude-export/design-system/screens-6.jsx",
          },
        ],
      },
      {
        id: "billing-status",
        label: "Refresh entitlement status",
        intent: "Read current plan snapshot.",
        tags: [
          {
            type: "@behavior",
            value: "Refresh active plan, trial state, and remaining benefits.",
          },
          {
            type: "@convex-query-needed",
            value: "subscriptionStates.getCurrent",
          },
          {
            type: "@schema-delta",
            value: "subscriptionStates.trialEndsAt",
          },
          {
            type: "@prd",
            value: "PRD §15",
          },
          {
            type: "@source",
            value: "docs/design/claude-export/design-system/screens-6.jsx",
          },
        ],
      },
    ],
  },
  {
    id: "trial-end",
    title: "Trial ended",
    category: "Settings",
    route: "/billing/trial-end",
    summary: "Gentle trial end screen with recovery options.",
    prdRefs: ["§15", "§1"],
    sourceRefs: ["screens-6.jsx"],
    controls: createControls("trial-end"),
  },
  {
    id: "ask-founder",
    title: "Ask the founder",
    category: "Settings",
    route: "/ask-founder",
    summary: "Asynchronous founder queue messaging scaffold.",
    prdRefs: ["§4 Screen 35", "§15"],
    sourceRefs: ["screens-6.jsx"],
    controls: createControls("ask-founder"),
  },
  {
    id: "notifications",
    title: "Notifications",
    category: "Settings",
    route: "/notifications",
    summary: "Notification preference center scaffold.",
    prdRefs: ["§4 Screen 36", "§17"],
    sourceRefs: ["screens-6.jsx"],
    controls: createControls("notifications"),
  },
];

export const webScreenFixtures = WEB_SCREEN_DEFINITIONS.map(createScreenFixture);

export const webScreenFixturesById = Object.fromEntries(
  webScreenFixtures.map((screen) => [screen.id, screen])
) as Record<(typeof webScreenFixtures)[number]["id"], ScreenFixture>;

export function getWebScreenFixture(screenId: string): ScreenFixture {
  const fixture = webScreenFixturesById[screenId as keyof typeof webScreenFixturesById];
  if (!fixture) {
    throw new Error(`Unknown web screen fixture: ${screenId}`);
  }
  return fixture;
}

function createMobileControls(screenId: string): MobileScreenFixture["controls"] {
  return [
    {
      id: `${screenId}-mobile-primary`,
      label: "Mobile primary action",
      intent: "Primary mobile control placeholder for backend handoff.",
      tags: [
        {
          type: "@behavior",
          value: "Run mobile primary control intent from fixture-driven scaffold state.",
        },
        {
          type: "@convex-query-needed",
          value: `${screenId}.mobileReadModel`,
        },
        {
          type: "@convex-mutation-needed",
          value: `${screenId}.mobileMutation`,
        },
        {
          type: "@navigate",
          value: `/(tempo)/${screenId}`,
        },
        {
          type: "@prd",
          value: "PRD §4, §9",
        },
        {
          type: "@source",
          value: "docs/design/claude-export/design-system/mobile/*.jsx",
        },
      ],
    },
  ];
}

const MOBILE_SCREEN_FIXTURES: MobileScreenFixture[] = [
  {
    id: "today",
    title: "Today",
    route: "(tempo)/(tabs)/today",
    sourceRefs: ["mobile/mobile-screens-a.jsx"],
    controls: createMobileControls("today"),
  },
  {
    id: "capture",
    title: "Capture",
    route: "(tempo)/capture",
    sourceRefs: ["mobile/mobile-screens-a.jsx"],
    controls: createMobileControls("capture"),
  },
  {
    id: "coach",
    title: "Coach",
    route: "(tempo)/(tabs)/coach",
    sourceRefs: ["mobile/mobile-screens-a.jsx"],
    controls: createMobileControls("coach"),
  },
  {
    id: "tasks",
    title: "Tasks",
    route: "(tempo)/(tabs)/tasks",
    sourceRefs: ["mobile/mobile-screens-a.jsx"],
    controls: createMobileControls("tasks"),
  },
  {
    id: "notes",
    title: "Notes",
    route: "(tempo)/(tabs)/notes",
    sourceRefs: ["mobile/mobile-screens-a.jsx"],
    controls: createMobileControls("notes"),
  },
  {
    id: "journal",
    title: "Journal",
    route: "(tempo)/journal",
    sourceRefs: ["mobile/mobile-screens-b.jsx"],
    controls: createMobileControls("journal"),
  },
  {
    id: "habits",
    title: "Habits",
    route: "(tempo)/habits",
    sourceRefs: ["mobile/mobile-screens-b.jsx"],
    controls: createMobileControls("habits"),
  },
  {
    id: "calendar",
    title: "Calendar",
    route: "(tempo)/calendar",
    sourceRefs: ["mobile/mobile-screens-b.jsx"],
    controls: createMobileControls("calendar"),
  },
  {
    id: "routines",
    title: "Routines",
    route: "(tempo)/routines",
    sourceRefs: ["mobile/mobile-screens-b.jsx"],
    controls: createMobileControls("routines"),
  },
  {
    id: "templates",
    title: "Templates",
    route: "(tempo)/templates",
    sourceRefs: ["mobile/mobile-screens-b.jsx"],
    controls: createMobileControls("templates"),
  },
  {
    id: "settings",
    title: "Settings",
    route: "(tempo)/settings",
    sourceRefs: ["mobile/mobile-screens-b.jsx"],
    controls: createMobileControls("settings"),
  },
  {
    id: "onboarding",
    title: "Onboarding",
    route: "(auth)/onboarding",
    sourceRefs: ["mobile/mobile-screens-b.jsx"],
    controls: createMobileControls("onboarding"),
  },
];

export const mobileScreenFixtures = MOBILE_SCREEN_FIXTURES;
