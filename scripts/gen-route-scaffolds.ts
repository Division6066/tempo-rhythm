#!/usr/bin/env bun
/**
 * Generate Next.js + Expo route scaffolds for the Tempo Flow design port.
 *
 * Idempotent: overwrites any scaffold file that still contains the
 * `@generated-by: T-F004` marker; skips files that have diverged.
 *
 * Run:  bun run scripts/gen-route-scaffolds.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type WebScaffold = {
  route: string; // posix, relative to apps/web/app
  slug: string;
  title: string;
  category: string;
  source: string;
  summary: string;
  queries?: string[];
  mutations?: string[];
  navigates?: string[];
  bare?: boolean;
  isDynamic?: boolean;
  dynamicParam?: string;
};

const WEB: WebScaffold[] = [
  // Flow
  { route: "(tempo)/today/page.tsx", slug: "today", title: "Today", category: "Flow", source: "screens-1.jsx", summary: "Single-column daily canvas. Brain-dump composer + staged plan + coach suggestion.", queries: ["tasks.listToday", "calendar.listToday", "coach.latestSuggestion"], mutations: ["tasks.capture", "tasks.complete", "tasks.stage"], navigates: ["/brain-dump", "/coach"] },
  { route: "(bare)/daily-note/page.tsx", slug: "daily-note", title: "Daily note", category: "Flow", source: "screens-1.jsx", summary: "Distraction-free daily note surface.", queries: ["journal.getDaily"], mutations: ["journal.updateDaily"], bare: true },
  { route: "(tempo)/brain-dump/page.tsx", slug: "brain-dump", title: "Brain dump", category: "Flow", source: "screens-1.jsx", summary: "Rapid capture with auto-sort suggestions.", queries: ["inbox.list"], mutations: ["inbox.capture", "inbox.sort"] },
  { route: "(tempo)/coach/page.tsx", slug: "coach", title: "Coach", category: "Flow", source: "screens-1.jsx + coach-dock.jsx", summary: "Conversational AI coach surface. Accept / tweak / skip suggestions.", queries: ["coach.thread"], mutations: ["coach.accept", "coach.tweak", "coach.skip"] },
  { route: "(tempo)/plan/page.tsx", slug: "plan", title: "Planning", category: "Flow", source: "screens-1.jsx", summary: "Week / month planning grid.", queries: ["plan.week"], mutations: ["plan.stage"] },

  // Library
  { route: "(tempo)/tasks/page.tsx", slug: "tasks", title: "Tasks", category: "Library", source: "screens-2.jsx", summary: "Tasks inbox with filters and grouping.", queries: ["tasks.list"], mutations: ["tasks.complete", "tasks.create"] },
  { route: "(tempo)/notes/page.tsx", slug: "notes", title: "Notes", category: "Library", source: "screens-2.jsx", summary: "Notes library — grid with backlinks.", queries: ["notes.list"], mutations: ["notes.create"] },
  { route: "(tempo)/notes/[id]/page.tsx", slug: "note-detail", title: "Note editor", category: "Library", source: "screens-2.jsx", summary: "Rich-text note editor with slash commands.", queries: ["notes.get"], mutations: ["notes.update"], isDynamic: true, dynamicParam: "id" },
  { route: "(tempo)/journal/page.tsx", slug: "journal", title: "Journal", category: "Library", source: "screens-2.jsx", summary: "Dated journal entries.", queries: ["journal.list"], mutations: ["journal.create"] },
  { route: "(tempo)/calendar/page.tsx", slug: "calendar", title: "Calendar", category: "Library", source: "screens-3.jsx", summary: "Week + month calendar with task overlay.", queries: ["calendar.list"], mutations: ["calendar.schedule"] },
  { route: "(tempo)/habits/page.tsx", slug: "habits", title: "Habits", category: "Library", source: "screens-3.jsx", summary: "Habit rings with weekly progress.", queries: ["habits.list"], mutations: ["habits.logComplete"] },
  { route: "(tempo)/habits/[id]/page.tsx", slug: "habit-detail", title: "Habit detail", category: "Library", source: "screens-3.jsx", summary: "Single-habit detail with streak history.", queries: ["habits.get"], mutations: ["habits.logComplete", "habits.update"], isDynamic: true, dynamicParam: "id" },
  { route: "(tempo)/routines/page.tsx", slug: "routines", title: "Routines", category: "Library", source: "screens-3.jsx", summary: "Routine library.", queries: ["routines.list"], mutations: ["routines.create"] },
  { route: "(tempo)/routines/[id]/page.tsx", slug: "routine-detail", title: "Routine guided", category: "Library", source: "screens-3.jsx", summary: "Guided run of a routine.", queries: ["routines.get"], mutations: ["routines.logRun"], isDynamic: true, dynamicParam: "id" },
  { route: "(tempo)/goals/page.tsx", slug: "goals", title: "Goals", category: "Library", source: "screens-4.jsx", summary: "Goals list with progress.", queries: ["goals.list"], mutations: ["goals.create"] },
  { route: "(tempo)/goals/[id]/page.tsx", slug: "goal-detail", title: "Goal detail", category: "Library", source: "screens-4.jsx", summary: "Goal detail view with milestones.", queries: ["goals.get"], mutations: ["goals.update", "goals.logMilestone"], isDynamic: true, dynamicParam: "id" },
  { route: "(tempo)/goals/progress/page.tsx", slug: "goals-progress", title: "Goals chart", category: "Library", source: "screens-4.jsx", summary: "Goals progress chart.", queries: ["goals.progressSeries"] },
  { route: "(tempo)/projects/page.tsx", slug: "projects", title: "Projects", category: "Library", source: "screens-4.jsx", summary: "Projects directory.", queries: ["projects.list"], mutations: ["projects.create"] },
  { route: "(tempo)/projects/[id]/page.tsx", slug: "project-detail", title: "Project detail", category: "Library", source: "screens-4.jsx", summary: "Project detail with tasks + notes.", queries: ["projects.get", "projects.tasks"], mutations: ["projects.update"], isDynamic: true, dynamicParam: "id" },
  { route: "(tempo)/projects/[id]/kanban/page.tsx", slug: "project-kanban", title: "Project kanban", category: "Library", source: "screens-4.jsx", summary: "Project kanban board.", queries: ["projects.get", "projects.tasks"], mutations: ["tasks.moveColumn"], isDynamic: true, dynamicParam: "id" },

  // You
  { route: "(tempo)/insights/page.tsx", slug: "analytics", title: "Insights", category: "You", source: "screens-5.jsx", summary: "Personal analytics & trends.", queries: ["insights.summary"] },
  { route: "(tempo)/activity/page.tsx", slug: "activity", title: "Recent activity", category: "You", source: "screens-5.jsx", summary: "Activity feed of changes.", queries: ["activity.list"] },
  { route: "(tempo)/templates/page.tsx", slug: "templates", title: "Templates", category: "You", source: "screens-templates.jsx", summary: "Template library.", queries: ["templates.list"] },
  { route: "(bare)/templates/builder/page.tsx", slug: "template-builder", title: "Template builder", category: "You", source: "screens-template-builder.jsx + -ui.jsx + -slash.jsx", summary: "Full-screen template builder with slash command DSL.", queries: ["templates.get"], mutations: ["templates.save"], bare: true },
  { route: "(bare)/templates/run/[id]/page.tsx", slug: "template-run", title: "Template run", category: "You", source: "screens-template-run.jsx", summary: "Runs a template step by step.", queries: ["templates.get"], mutations: ["templates.logRun"], bare: true, isDynamic: true, dynamicParam: "id" },
  { route: "(tempo)/templates/editor/[id]/page.tsx", slug: "template-editor", title: "Template editor (legacy)", category: "You", source: "screens-5.jsx", summary: "Legacy template editor.", isDynamic: true, dynamicParam: "id" },
  { route: "(tempo)/templates/sketch/page.tsx", slug: "template-sketch", title: "Template sketch", category: "You", source: "screens-5.jsx", summary: "Template sketch playground." },
  { route: "(tempo)/search/page.tsx", slug: "search", title: "Search", category: "You", source: "screens-5.jsx", summary: "Global search with previews.", queries: ["search.everything"] },
  { route: "(tempo)/command/page.tsx", slug: "command", title: "Command bar", category: "You", source: "screens-5.jsx", summary: "Command bar landing page." },
  { route: "(tempo)/empty-states/page.tsx", slug: "empty-states", title: "Empty states gallery", category: "You", source: "screens-6.jsx", summary: "Gallery of anti-shame empty states." },

  // Settings
  { route: "(tempo)/settings/profile/page.tsx", slug: "settings", title: "Profile", category: "Settings", source: "screens-6.jsx", summary: "User profile settings.", queries: ["users.me"], mutations: ["users.updateProfile"] },
  { route: "(tempo)/settings/preferences/page.tsx", slug: "settings-prefs", title: "Preferences", category: "Settings", source: "screens-6.jsx", summary: "Theme, dyslexia font, language, motion preferences.", queries: ["users.preferences"], mutations: ["users.updatePreferences"] },
  { route: "(tempo)/settings/integrations/page.tsx", slug: "settings-integrations", title: "Integrations", category: "Settings", source: "screens-6.jsx", summary: "Google Calendar & other integrations.", queries: ["integrations.list"], mutations: ["integrations.connect", "integrations.disconnect"] },
  { route: "(tempo)/billing/page.tsx", slug: "billing", title: "Trial & billing", category: "Settings", source: "screens-6.jsx", summary: "Trial countdown + RevenueCat entitlement status.", queries: ["billing.status"] },
  { route: "(bare)/billing/trial-end/page.tsx", slug: "trial-end", title: "Trial ended", category: "Settings", source: "screens-6.jsx", summary: "Anti-shame trial-ended screen (continue / pause / walk-away).", bare: true },
  { route: "(tempo)/ask-founder/page.tsx", slug: "ask-founder", title: "Ask the founder", category: "Settings", source: "screens-6.jsx", summary: "Direct channel to send feedback.", mutations: ["feedback.send"] },
  { route: "(tempo)/notifications/page.tsx", slug: "notifications", title: "Notifications", category: "Settings", source: "screens-6.jsx", summary: "Quiet notification settings.", queries: ["users.notificationPrefs"], mutations: ["users.updateNotificationPrefs"] },

  // Onboarding + Auth (bare)
  { route: "(bare)/sign-in/page.tsx", slug: "sign-in", title: "Sign in", category: "Onboarding", source: "screens-7.jsx", summary: "Sign in — email + magic link.", mutations: ["auth.signIn"], bare: true },
  { route: "(bare)/onboarding/page.tsx", slug: "onboarding", title: "Onboarding", category: "Onboarding", source: "screens-7.jsx", summary: "5-step onboarding (welcome → personalization → template → first brain dump → first plan).", mutations: ["users.completeOnboarding"], bare: true, navigates: ["/today"] },
];

type MobileScaffold = {
  route: string; // relative to apps/mobile/app
  slug: string;
  title: string;
  source: string;
  summary: string;
};

const MOBILE: MobileScaffold[] = [
  { route: "(tempo)/(tabs)/today.tsx", slug: "today", title: "Today", source: "mobile/mobile-screens-a.jsx", summary: "Tab home: today capsule + coach suggestion." },
  { route: "(tempo)/(tabs)/tasks.tsx", slug: "tasks", title: "Tasks", source: "mobile/mobile-screens-a.jsx", summary: "Tasks list with quick-check." },
  { route: "(tempo)/(tabs)/notes.tsx", slug: "notes", title: "Notes", source: "mobile/mobile-screens-a.jsx", summary: "Notes list." },
  { route: "(tempo)/(tabs)/coach.tsx", slug: "coach", title: "Coach", source: "mobile/mobile-screens-a.jsx", summary: "Coach conversation." },
  { route: "(tempo)/capture.tsx", slug: "capture", title: "Capture", source: "mobile/mobile-screens-a.jsx", summary: "Modal capture composer with voice + text." },
  { route: "(tempo)/journal.tsx", slug: "journal", title: "Journal", source: "mobile/mobile-screens-b.jsx", summary: "Mobile journal." },
  { route: "(tempo)/habits.tsx", slug: "habits", title: "Habits", source: "mobile/mobile-screens-b.jsx", summary: "Mobile habits with ring rows." },
  { route: "(tempo)/calendar.tsx", slug: "calendar", title: "Calendar", source: "mobile/mobile-screens-b.jsx", summary: "Mobile calendar week view." },
  { route: "(tempo)/routines.tsx", slug: "routines", title: "Routines", source: "mobile/mobile-screens-b.jsx", summary: "Mobile routines." },
  { route: "(tempo)/templates.tsx", slug: "templates", title: "Templates", source: "mobile/mobile-screens-b.jsx", summary: "Mobile templates." },
  { route: "(tempo)/settings.tsx", slug: "settings", title: "Settings", source: "mobile/mobile-screens-b.jsx", summary: "Mobile settings." },
  { route: "(auth)/onboarding.tsx", slug: "onboarding", title: "Onboarding", source: "mobile/mobile-screens-b.jsx", summary: "Mobile onboarding flow." },
];

const SCAFFOLD_MARKERS = [
  "@generated-by: T-F004 scaffold",
  "@generated-by: T-F008 scaffold",
];

function writeScaffoldIfClean(path: string, contents: string) {
  if (existsSync(path)) {
    const current = readFileSync(path, "utf8");
    const isScaffold = SCAFFOLD_MARKERS.some((m) => current.includes(m));
    if (!isScaffold) {
      console.log(`  SKIP (diverged): ${path}`);
      return false;
    }
  }
  try {
    mkdirSync(dirname(path), { recursive: true });
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code !== "EEXIST") throw e;
  }
  writeFileSync(path, contents);
  console.log(`  WRITE: ${path}`);
  return true;
}

function webPageBody(s: WebScaffold): string {
  const header = [
    "/**",
    " * @generated-by: T-F004 scaffold — replace with T-F005* port.",
    ` * @screen: ${s.slug}`,
    ` * @category: ${s.category}`,
    ` * @source: docs/design/claude-export/design-system/${s.source}`,
    ` * @summary: ${s.summary}`,
    s.queries?.length
      ? ` * @queries: ${s.queries.join(", ")}`
      : ` * @queries: (none)`,
    s.mutations?.length
      ? ` * @mutations: ${s.mutations.join(", ")}`
      : ` * @mutations: (none)`,
    s.navigates?.length
      ? ` * @routes-to: ${s.navigates.join(", ")}`
      : undefined,
    " * @auth: required",
    " * @notes: Copy placeholder from Claude export; copy pass in a later ticket.",
    " */",
  ]
    .filter(Boolean)
    .join("\n");

  if (s.isDynamic && s.dynamicParam) {
    return `${header}
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

type Params = { ${s.dynamicParam}: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { ${s.dynamicParam} } = await params;
  return (
    <ScaffoldScreen
      title="${s.title}"
      category="${s.category}"
      source="${s.source}"
      summary={\`${s.summary} (id: \${${s.dynamicParam}})\`}
    />
  );
}
`;
  }

  return `${header}
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="${s.title}"
      category="${s.category}"
      source="${s.source}"
      summary="${s.summary.replace(/"/g, '\\"')}"
    />
  );
}
`;
}

function mobilePageBody(s: MobileScaffold): string {
  const header = [
    "/**",
    " * @generated-by: T-F008 scaffold — replace with T-F009* port.",
    ` * @screen: ${s.slug}`,
    " * @platform: mobile",
    ` * @source: docs/design/claude-export/design-system/${s.source}`,
    ` * @summary: ${s.summary}`,
    " * @notes: Copy placeholder from Claude export; copy pass in a later ticket.",
    " */",
  ].join("\n");

  return `${header}
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-3">
        <Text className="text-2xl font-semibold text-foreground">${s.title}</Text>
        <Text className="text-sm text-muted-foreground">${s.summary}</Text>
        <Text className="text-xs text-muted-foreground font-mono">
          scaffold · port from ${s.source}
        </Text>
      </View>
    </SafeAreaView>
  );
}
`;
}

const repoRoot = resolve(import.meta.dir, "..");

let webCount = 0;
let mobileCount = 0;

console.log("Generating web scaffolds...");
for (const s of WEB) {
  const target = resolve(repoRoot, "apps/web/app", s.route);
  if (writeScaffoldIfClean(target, webPageBody(s))) webCount++;
}

console.log("\nGenerating mobile scaffolds...");
for (const s of MOBILE) {
  const target = resolve(repoRoot, "apps/mobile/app", s.route);
  if (writeScaffoldIfClean(target, mobilePageBody(s))) mobileCount++;
}

console.log(
  `\nDone. Web scaffolds: ${webCount}/${WEB.length}, Mobile: ${mobileCount}/${MOBILE.length}.`,
);
