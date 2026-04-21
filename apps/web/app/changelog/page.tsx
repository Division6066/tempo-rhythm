/**
 * @screen: changelog
 * @owner: cursor-cloud-1
 * @prd: PRD §14
 * @source: docs/design/claude-export/design-system/changelog.html
 * @summary: Public shipping notes feed with optional subscription call-to-action.
 */
export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-background px-6 py-10 text-foreground">
      <header className="flex flex-col gap-2">
        <p className="font-eyebrow">Tempo changelog</p>
        <h1 className="text-h1 font-serif">Quiet updates, shipped often.</h1>
        <p className="text-body text-muted-foreground">
          Major and minor product updates for web and mobile.
        </p>
      </header>

      <section className="rounded-xl border border-border-soft bg-card p-4">
        <h2 className="text-h4 font-serif">v1.0.0</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-small text-muted-foreground">
          <li>42 web screens and 12 mobile screens mapped to PRD inventory.</li>
          <li>Tier-A pseudocode tags added for backend handoff.</li>
          <li>Generated HTML preview set for cross-platform review.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-border-soft bg-card p-4">
        <h2 className="text-h4 font-serif">Stay in the loop</h2>
        {/* @component: SubscribeToChangelogButton
            @behavior: Save user preference to receive changelog updates by email.
            @convex-mutation-needed: profiles.subscribeToChangelog
            @schema-delta: profiles.changelogSubscribedAt
            @confirm: none
            @prd: PRD §14
            @source: docs/design/claude-export/design-system/changelog.html */}
        <button
          type="button"
          className="mt-3 rounded-full bg-foreground px-4 py-2 text-small font-medium text-background"
        >
          Subscribe to updates
        </button>
      </section>

      <footer className="pt-2">
        {/* @component: BackToLandingLink
            @behavior: Navigate user back to public landing page.
            @navigate: /
            @prd: PRD §14
            @source: docs/design/claude-export/design-system/changelog.html */}
        <a href="/" className="text-small text-muted-foreground underline-offset-4 hover:underline">
          Back to home
        </a>
      </footer>
    </main>
  );
}
