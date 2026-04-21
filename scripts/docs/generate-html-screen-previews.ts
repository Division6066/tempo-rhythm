import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { mobileScreenFixtures, webScreenFixtures } from "../../packages/mock-data/src/screens";

type StaticScreen = {
  id: string;
  title: string;
  route: string;
  category: string;
  summary: string;
  prdRefs: string[];
  sourceRefs: string[];
  controls: Array<{
    id: string;
    label: string;
    intent: string;
    tags: Array<{ type: string; value: string }>;
  }>;
};

const STATIC_WEB_SCREENS: StaticScreen[] = [
  {
    id: "landing",
    title: "Landing",
    route: "/",
    category: "Marketing",
    summary: "Public home page for desktop and phone web.",
    prdRefs: ["PRD §4", "PRD §14"],
    sourceRefs: ["docs/design/claude-export/design-system/landing.html"],
    controls: [
      {
        id: "landing-primary-cta",
        label: "Get Started",
        intent: "Route visitor into sign-in or onboarding.",
        tags: [
          { type: "@behavior", value: "Navigate from landing hero CTA to account entry flow." },
          { type: "@navigate", value: "/sign-in" },
          { type: "@prd", value: "PRD §4" },
          { type: "@source", value: "docs/design/claude-export/design-system/landing.html" },
        ],
      },
    ],
  },
  {
    id: "about",
    title: "About",
    route: "/about",
    category: "Marketing",
    summary: "Founder and product mission page.",
    prdRefs: ["PRD §14"],
    sourceRefs: ["docs/design/claude-export/design-system/about.html"],
    controls: [
      {
        id: "about-nav",
        label: "Back to home",
        intent: "Return visitor to landing page.",
        tags: [
          { type: "@behavior", value: "Navigate user back to landing from about page." },
          { type: "@navigate", value: "/" },
          { type: "@prd", value: "PRD §14" },
          { type: "@source", value: "docs/design/claude-export/design-system/about.html" },
        ],
      },
    ],
  },
  {
    id: "changelog",
    title: "Changelog",
    route: "/changelog",
    category: "Marketing",
    summary: "Product update feed for public users.",
    prdRefs: ["PRD §14"],
    sourceRefs: ["docs/design/claude-export/design-system/changelog.html"],
    controls: [
      {
        id: "changelog-subscribe",
        label: "Subscribe",
        intent: "Save changelog updates preference.",
        tags: [
          { type: "@behavior", value: "Capture user email preference for changelog updates." },
          { type: "@convex-mutation-needed", value: "profiles.subscribeToChangelog" },
          { type: "@prd", value: "PRD §14" },
          { type: "@source", value: "docs/design/claude-export/design-system/changelog.html" },
        ],
      },
    ],
  },
  {
    id: "sign-in",
    title: "Sign In",
    route: "/sign-in",
    category: "Auth",
    summary: "Account entry flow before tempo shell.",
    prdRefs: ["PRD §4 Screen 37", "PRD §15"],
    sourceRefs: ["docs/design/claude-export/design-system/screens-7.jsx"],
    controls: [
      {
        id: "signin-submit",
        label: "Continue",
        intent: "Authenticate and enter app.",
        tags: [
          { type: "@behavior", value: "Submit sign-in credentials and continue to app shell." },
          { type: "@convex-action-needed", value: "auth.signIn" },
          { type: "@prd", value: "PRD §4 Screen 37" },
          { type: "@source", value: "docs/design/claude-export/design-system/screens-7.jsx" },
        ],
      },
    ],
  },
  {
    id: "onboarding",
    title: "Onboarding",
    route: "/onboarding",
    category: "Auth",
    summary: "Initial setup flow before first day plan.",
    prdRefs: ["PRD §4 Screen 38-41", "PRD §10"],
    sourceRefs: ["docs/design/claude-export/design-system/screens-7.jsx"],
    controls: [
      {
        id: "onboarding-complete",
        label: "Complete setup",
        intent: "Finalize onboarding and enter today route.",
        tags: [
          { type: "@behavior", value: "Commit onboarding choices and route user to today." },
          { type: "@convex-mutation-needed", value: "users.completeOnboarding" },
          { type: "@navigate", value: "/today" },
          { type: "@prd", value: "PRD §4 Screen 41" },
          { type: "@source", value: "docs/design/claude-export/design-system/screens-7.jsx" },
        ],
      },
    ],
  },
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function controlTagsHtml(
  tags: Array<{ type: string; value: string }>,
): string {
  return tags
    .map(
      (tag) =>
        `<li><code>${escapeHtml(tag.type)}</code>: ${escapeHtml(tag.value)}</li>`,
    )
    .join("");
}

function screenHtml(screen: StaticScreen, platform: "web" | "mobile"): string {
  const controlsMarkup = screen.controls
    .map(
      (control) => `
        <section class="control">
          <h2>${escapeHtml(control.label)}</h2>
          <p>${escapeHtml(control.intent)}</p>
          <ul>${controlTagsHtml(control.tags)}</ul>
        </section>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(screen.title)} · ${platform} preview</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: Inter, Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f4; color: #1f2937; }
      main { margin: 0 auto; max-width: 960px; display: grid; gap: 16px; }
      header, .control { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
      h1, h2, p, ul { margin: 0; }
      h1 { font-family: Newsreader, Georgia, serif; margin-bottom: 8px; }
      h2 { font-size: 16px; margin-bottom: 6px; }
      p { margin-bottom: 8px; line-height: 1.45; }
      ul { padding-left: 18px; display: grid; gap: 4px; }
      code { font-family: "IBM Plex Mono", Consolas, monospace; font-size: 12px; }
      .meta { font-size: 13px; color: #4b5563; display: grid; gap: 4px; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${escapeHtml(screen.title)}</h1>
        <div class="meta">
          <div><strong>Screen ID:</strong> ${escapeHtml(screen.id)}</div>
          <div><strong>Platform:</strong> ${platform}</div>
          <div><strong>Category:</strong> ${escapeHtml(screen.category)}</div>
          <div><strong>Route:</strong> ${escapeHtml(screen.route)}</div>
          <div><strong>Summary:</strong> ${escapeHtml(screen.summary)}</div>
          <div><strong>PRD refs:</strong> ${escapeHtml(screen.prdRefs.join(", "))}</div>
          <div><strong>Source refs:</strong> ${escapeHtml(screen.sourceRefs.join(", "))}</div>
        </div>
      </header>
      ${controlsMarkup}
    </main>
  </body>
</html>`;
}

function writeScreenFile(
  targetRoot: string,
  screen: StaticScreen,
  platform: "web" | "mobile",
): void {
  const filePath = resolve(targetRoot, `${screen.id}.html`);
  writeFileSync(filePath, screenHtml(screen, platform), "utf8");
}

function indexHtml(
  title: string,
  screens: StaticScreen[],
  relativeBase: string,
): string {
  const links = screens
    .map(
      (screen) =>
        `<li><a href="${escapeHtml(relativeBase)}/${escapeHtml(screen.id)}.html">${escapeHtml(screen.title)}</a> <small>${escapeHtml(screen.route)}</small></li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; margin: 0; padding: 24px; background: #fafaf9; color: #111827; }
      main { margin: 0 auto; max-width: 880px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
      ul { margin: 0; padding-left: 20px; display: grid; gap: 8px; }
      small { color: #6b7280; margin-left: 6px; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <ul>${links}</ul>
    </main>
  </body>
</html>`;
}

function main(): void {
  const root = resolve("docs/design/generated-html");
  const webDir = resolve(root, "web");
  const mobileDir = resolve(root, "mobile");
  mkdirSync(webDir, { recursive: true });
  mkdirSync(mobileDir, { recursive: true });

  const generatedWebScreens: StaticScreen[] = [
    ...webScreenFixtures.map((screen) => ({
      ...screen,
      category: screen.category,
      prdRefs: screen.prdRefs,
      sourceRefs: screen.sourceRefs,
    })),
    ...STATIC_WEB_SCREENS,
  ];

  const generatedMobileScreens: StaticScreen[] = mobileScreenFixtures.map((screen) => ({
    ...screen,
    category: "Mobile",
    summary: "Generated static HTML preview for mobile design and wiring tags.",
    prdRefs: ["PRD §4", "PRD §9"],
    sourceRefs: screen.sourceRefs,
  }));

  for (const screen of generatedWebScreens) {
    writeScreenFile(webDir, screen, "web");
  }
  for (const screen of generatedMobileScreens) {
    writeScreenFile(mobileDir, screen, "mobile");
  }

  writeFileSync(
    resolve(root, "index.html"),
    indexHtml(
      "Tempo generated HTML screen previews",
      [
        ...generatedWebScreens.map((screen) => ({
          ...screen,
          id: `web/${screen.id}`,
          title: `Web · ${screen.title}`,
        })),
        ...generatedMobileScreens.map((screen) => ({
          ...screen,
          id: `mobile/${screen.id}`,
          title: `Mobile · ${screen.title}`,
        })),
      ],
      ".",
    ),
    "utf8",
  );

  console.log(
    `Generated ${generatedWebScreens.length} web HTML screens and ${generatedMobileScreens.length} mobile HTML screens.`,
  );
}

main();
