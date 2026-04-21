import Link from "next/link";
import { BrandMark, Wordmark } from "@tempo/ui/brand";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { IS_DEMO_MODE } from "@/lib/demo-mode";

/**
 * @screen: landing
 * @category: Marketing
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 37, §14
 * @source: docs/design/claude-export/design-system/landing.html
 * @summary: Marketing landing page (hero, features, coach samples, pricing, founder letter, testimonials, footer).
 * @auth: public
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-[var(--container-tempo)] items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </Link>
        <div className="flex items-center gap-2">
          {/*
           * @behavior: Marketing-to-app: view product pitch on a separate route.
           * @navigate: /about
           */}
          <Link href="/about">
            <Button variant="ghost" size="sm">
              About
            </Button>
          </Link>
          {/*
           * @behavior: View public changelog.
           * @navigate: /changelog
           */}
          <Link href="/changelog">
            <Button variant="ghost" size="sm">
              Changelog
            </Button>
          </Link>
          {/*
           * @behavior: Open sign-in flow for returning users.
           * @navigate: /sign-in
           * @convex-query-needed: auth.getSessionState
           */}
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          {/*
           * @behavior: Start onboarding from top nav CTA.
           * @navigate: /onboarding
           * @convex-mutation-needed: users.startOnboardingSession
           * @provider-needed: revenuecat (trial gating after onboarding)
           */}
          <Link href="/onboarding">
            <Button variant="primary" size="sm">
              Start your $1 walk
            </Button>
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-[var(--container-tempo)] px-6 pb-24 pt-16">
        <div className="flex max-w-3xl flex-col gap-6">
          {IS_DEMO_MODE ? (
            <Pill tone="orange">Demo mode · no backend required</Pill>
          ) : (
            <span className="font-eyebrow">Tempo Flow · v0</span>
          )}
          <h1 className="font-display leading-[1.04]">
            Your brain's{" "}
            <em className="tempo-gradient-text not-italic">operating system</em>.
          </h1>
          <p className="font-serif text-h3 leading-relaxed text-muted-foreground">
            An overwhelm-first AI daily planner for ADHD, autistic, and
            neurodivergent brains. Never shaming. Always gentle.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {/*
             * @behavior: Start onboarding from hero CTA.
             * @navigate: /onboarding
             * @convex-mutation-needed: users.startOnboardingSession
             * @provider-needed: revenuecat
             */}
            <Link href="/onboarding">
              <Button variant="primary" size="lg">
                Start your seven-day walk — $1
              </Button>
            </Link>
            {/*
             * @behavior: Enter the live app preview; demo mode skips auth.
             * @navigate: /today
             * @convex-query-needed: users.canAccessWebAppPreview
             */}
            <Link href="/today">
              <Button variant="soft" size="lg">
                Preview the app →
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow">Capture</div>
            <h3 className="mt-2 font-serif text-h4">Brain dump, not inbox</h3>
            <p className="mt-2 text-small text-muted-foreground">
              Spill everything in one place. The coach extracts tasks, ideas,
              and reminders — and waits for your accept before anything lands.
            </p>
          </SoftCard>
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow">Plan</div>
            <h3 className="mt-2 font-serif text-h4">Anchors, not blocks</h3>
            <p className="mt-2 text-small text-muted-foreground">
              Stage three things you can actually do today. Energy-aware
              scheduling keeps afternoons soft on purpose.
            </p>
          </SoftCard>
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow">Coach</div>
            <h3 className="mt-2 font-serif text-h4">A quiet second brain</h3>
            <p className="mt-2 text-small text-muted-foreground">
              Warmth dial per user. Voice or text. Always offers accept / tweak
              / skip — never writes silently.
            </p>
          </SoftCard>
        </div>

        <SoftCard tone="sunken" padding="lg" className="mt-12 max-w-2xl">
          <div className="flex flex-col gap-2">
            <span className="font-eyebrow">For designers &amp; testers</span>
            <p className="text-small text-muted-foreground">
              The full click-through prototype is live across 42 web routes and
              12 React Native routes. Press{" "}
              <code className="rounded border border-border-soft bg-card px-1.5 py-0.5 font-mono">
                ⌘K
              </code>{" "}
              inside the app to jump anywhere. All interactive controls carry
              pseudocode tags so the backend run knows exactly what to wire.
            </p>
          </div>
        </SoftCard>
      </section>
    </main>
  );
}
