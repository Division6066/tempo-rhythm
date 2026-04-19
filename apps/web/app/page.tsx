import Link from "next/link";
import { BrandMark, Wordmark } from "@tempo/ui/brand";
import { Button, SoftCard } from "@tempo/ui/primitives";

/**
 * @generated-by: T-F004 scaffold — replace with T-F005f (landing port).
 * @screen: landing
 * @category: Marketing
 * @source: docs/design/claude-export/design-system/landing.html
 * @summary: Marketing landing page (hero, features, coach samples, pricing, founder letter, testimonials, footer).
 * @auth: public
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 py-5 max-w-[var(--container-tempo)] mx-auto">
        <div className="flex items-center gap-2">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button variant="primary" size="sm">
              Start your $1 walk
            </Button>
          </Link>
        </div>
      </nav>

      <section className="px-6 pt-16 pb-24 max-w-[var(--container-tempo)] mx-auto">
        <div className="max-w-3xl flex flex-col gap-6">
          <span className="font-eyebrow">Scaffold · landing page</span>
          <h1 className="font-display leading-[1.04]">
            Your brain's <em className="tempo-gradient-text not-italic">operating system</em>.
          </h1>
          <p className="text-h3 text-muted-foreground leading-relaxed font-serif">
            An overwhelm-first daily planner for ADHD, autistic, and
            neurodivergent brains. Never shaming. Always gentle.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/onboarding">
              <Button variant="primary" size="lg">
                Start your seven-day walk — $1
              </Button>
            </Link>
            <Link href="/today">
              <Button variant="soft" size="lg">
                Preview the app
              </Button>
            </Link>
          </div>
        </div>

        <SoftCard tone="sunken" className="mt-12 max-w-2xl">
          <div className="flex flex-col gap-2">
            <span className="font-eyebrow">For designers &amp; testers</span>
            <span className="text-small text-muted-foreground">
              The full click-through prototype is scaffolded across 42 web
              routes. Press{" "}
              <code className="rounded bg-card px-1.5 py-0.5 border border-border-soft font-mono">
                ⌘K
              </code>{" "}
              inside the app to jump to any screen. Real JSX content ships in
              T-F005 tickets.
            </span>
          </div>
        </SoftCard>
      </section>
    </main>
  );
}
