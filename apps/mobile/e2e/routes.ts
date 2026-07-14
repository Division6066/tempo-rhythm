export type RtlSweepRoute = {
  id: string;
  path: string;
  sourceFile: string;
};

export const rtlLanguage = {
  locale: "he-IL",
  lang: "he",
  dir: "rtl",
} as const;

export const bidiFixture = {
  id: "condition-header-kicker",
  text: "בדיקת כיוון: 漢字 romaji נשארים בתוך משפט עברי רגוע",
} as const;

export const rtlSweepRoutes = [
  {
    id: "not-found",
    path: "/__rtl_missing_route__",
    sourceFile: "app/+not-found.tsx",
  },
  {
    id: "auth-index",
    path: "/(auth)?lang=he&preview=true",
    sourceFile: "app/(auth)/index.tsx",
  },
  {
    id: "auth-onboarding",
    path: "/(auth)/onboarding?lang=he&preview=true",
    sourceFile: "app/(auth)/onboarding.tsx",
  },
  {
    id: "auth-paywall",
    path: "/(auth)/paywall?lang=he&preview=true",
    sourceFile: "app/(auth)/paywall/index.tsx",
  },
  {
    id: "auth-sign-in",
    path: "/(auth)/sign-in?lang=he&preview=true",
    sourceFile: "app/(auth)/sign-in.tsx",
  },
  {
    id: "auth-sign-up",
    path: "/(auth)/sign-up?lang=he&preview=true",
    sourceFile: "app/(auth)/sign-up.tsx",
  },
  {
    id: "authenticated-index",
    path: "/(authenticated)?lang=he",
    sourceFile: "app/(authenticated)/index.tsx",
  },
  {
    id: "authenticated-page1",
    path: "/(authenticated)/page1?lang=he",
    sourceFile: "app/(authenticated)/page1.tsx",
  },
  {
    id: "authenticated-page2",
    path: "/(authenticated)/page2?lang=he",
    sourceFile: "app/(authenticated)/page2.tsx",
  },
  {
    id: "tempo-calendar",
    path: "/(tempo)/calendar?lang=he",
    sourceFile: "app/(tempo)/calendar.tsx",
  },
  {
    id: "tempo-capture",
    path: "/(tempo)/capture?lang=he",
    sourceFile: "app/(tempo)/capture.tsx",
  },
  {
    id: "tempo-habits",
    path: "/(tempo)/habits?lang=he",
    sourceFile: "app/(tempo)/habits.tsx",
  },
  {
    id: "tempo-journal",
    path: "/(tempo)/journal?lang=he",
    sourceFile: "app/(tempo)/journal.tsx",
  },
  {
    id: "tempo-routines",
    path: "/(tempo)/routines?lang=he",
    sourceFile: "app/(tempo)/routines.tsx",
  },
  {
    id: "tempo-settings",
    path: "/(tempo)/settings?lang=he",
    sourceFile: "app/(tempo)/settings.tsx",
  },
  {
    id: "tempo-templates",
    path: "/(tempo)/templates?lang=he",
    sourceFile: "app/(tempo)/templates.tsx",
  },
  {
    id: "tempo-tab-coach",
    path: "/(tempo)/(tabs)/coach?lang=he",
    sourceFile: "app/(tempo)/(tabs)/coach.tsx",
  },
  {
    id: "tempo-tab-notes",
    path: "/(tempo)/(tabs)/notes?lang=he",
    sourceFile: "app/(tempo)/(tabs)/notes.tsx",
  },
  {
    id: "tempo-tab-tasks",
    path: "/(tempo)/(tabs)/tasks?lang=he",
    sourceFile: "app/(tempo)/(tabs)/tasks.tsx",
  },
  {
    id: "tempo-tab-today",
    path: "/(tempo)/(tabs)/today?lang=he",
    sourceFile: "app/(tempo)/(tabs)/today.tsx",
  },
] as const satisfies readonly RtlSweepRoute[];
