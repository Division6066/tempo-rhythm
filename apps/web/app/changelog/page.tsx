import Link from "next/link";
import { BrandMark, Wordmark } from "@tempo/ui/brand";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";

/**
 * @screen: changelog
 * @category: Marketing
 * @owner: cursor-cloud-3
 * @prd: PRD §14
 * @source: docs/design/claude-export/design-system/changelog.html
 * @summary: Public product update feed.
 * @auth: public
 */
const ENTRIES = [
  {
    id: "0-2-0",
    version: "v0.2.0",
    date: "Apr 21, 2026",
    title: "Demoable frontend on 42 web + 12 mobile routes",
    body: "You can now click through the whole app without a backend. Every control carries pseudocode tags for the backend-wire run.",
    tone: "orange" as const,
  },
  {
    id: "0-1-0",
    version: "v0.1.0",
    date: "Apr 14, 2026",
    title: "Frontend design port",
    body: "Imported the Claude design system into Next 16 + Expo 54. First 42 web + 12 mobile scaffold routes landed.",
    tone: "slate" as const,
  },
  {
    id: "0-0-1",
    version: "v0.0.1",
    date: "Apr 7, 2026",
    title: "Repo setup",
    body: "Monorepo (Next + Expo + Convex + shared packages). Biome + Ultracite. CI pipeline.",
    tone: "neutral" as const,
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-[var(--container-tempo)] items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </Link>
        <div className="flex items-center gap-2">
          {/*
           * @behavior: Back to landing.
           * @navigate: /
           */}
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Back to home
            </Button>
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-[var(--container-tempo)] px-6 pb-20 pt-12">
        <div className="flex max-w-3xl flex-col gap-5">
          <Pill tone="orange">Changelog</Pill>
          <h1 className="font-display leading-[1.04]">
            What's new, and what just landed.
          </h1>
          <p className="font-serif text-h3 text-muted-foreground">
            Public, honest, and updated as we ship.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-5">
          {ENTRIES.map((entry) => (
            <SoftCard key={entry.id} tone="default" padding="md">
              <div className="flex items-center justify-between">
                <Pill tone={entry.tone}>{entry.version}</Pill>
                <span className="font-tabular text-caption text-muted-foreground">
                  {entry.date}
                </span>
              </div>
              <h3 className="mt-3 font-serif text-h3">{entry.title}</h3>
              <p className="mt-2 text-body text-muted-foreground">
                {entry.body}
              </p>
            </SoftCard>
          ))}
        </div>

        <SoftCard tone="sunken" padding="md" className="mt-12 max-w-2xl">
          <div className="font-eyebrow mb-2">Subscribe</div>
          <p className="text-small text-muted-foreground">
            Get one monthly email summarising changes. No marketing.
          </p>
          {/*
           * @behavior: Subscribe visitor email to monthly changelog digest.
           * @convex-mutation-needed: profiles.subscribeToChangelog
           */}
          <form className="mt-3 flex items-center gap-2">
            <input
              type="email"
              placeholder="you@domain.com"
              className="flex-1 rounded-lg border border-border-soft bg-card px-3 py-2 text-body focus:border-primary focus:outline-none"
              aria-label="Email for changelog subscription"
            />
            <Button variant="primary" size="md" type="submit">
              Subscribe
            </Button>
          </form>
        </SoftCard>
      </section>
    </main>
  );
}
