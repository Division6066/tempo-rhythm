import Link from "next/link";
import { BrandMark, Wordmark } from "@tempo/ui/brand";
import { Button, CoachBubble, SoftCard } from "@tempo/ui/primitives";

/**
 * @screen: landing
 * @category: Marketing
 * @source: docs/design/claude-export/design-system/landing.html
 * @summary: Marketing landing — hero, proof stats, feature intro, coach samples, CTA.
 * @queries: none
 * @mutations: none
 * @auth: public
 * @env: NEXT_PUBLIC_CONVEX_URL (app links only)
 */
export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-[var(--container-tempo)] items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/changelog">
            <Button variant="ghost" size="sm">
              Changelog
            </Button>
          </Link>
          {/*
            @action navSignIn
            @navigate: /sign-in
            @auth: public
            @env: NEXT_PUBLIC_CONVEX_URL
            @source: landing.html:L131
          */}
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          {/*
            @action navStartTrial
            @navigate: /onboarding
            @auth: public
            @source: landing.html:L132
          */}
          <Link href="/onboarding">
            <Button variant="primary" size="sm">
              Start your $1 week
            </Button>
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-[var(--container-tempo)] px-6 pb-24 pt-12 md:pt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-small text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          <span>1.0 ships April 23 · Closed beta open now</span>
        </div>
        <h1 className="mt-6 max-w-[12ch] font-display text-[clamp(2.75rem,6.8vw,5.75rem)] font-normal leading-[1.02] tracking-tight">
          A planner that won&apos;t <em className="tempo-gradient-text not-italic">shame</em>
          <br />
          your nervous system.
        </h1>
        <p className="mt-6 max-w-[54ch] font-serif text-[clamp(1.125rem,1.8vw,1.5rem)] leading-relaxed text-muted-foreground">
          Tempo Flow is a calm, AI-gentle planner for ADHD brains, autistic brains, anxious brains, and
          anyone who&apos;s tried seventeen productivity apps and bounced off all of them. Dump your
          thoughts. We&apos;ll help you find the next doable thing.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {/*
            @action heroStartTrial
            @navigate: /onboarding
            @auth: public
            @source: landing.html:L163
          */}
          <Link href="/onboarding">
            <Button variant="primary" size="lg" className="rounded-full px-6">
              Start your seven-day week · $1
            </Button>
          </Link>
          {/*
            @action heroTryDailyNote
            @navigate: /daily-note
            @auth: public
            @source: landing.html:L164
          */}
          <Link href="/daily-note">
            <Button variant="soft" size="lg" className="rounded-full px-6">
              Try the daily note
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-10">
          {[
            ["42", "handcrafted screens"],
            ["1", "person, one year"],
            ["$1", "week-long trial"],
            ["0", "guilt trips, ever"],
          ].map(([strong, label]) => (
            <div key={label}>
              <strong className="block font-serif text-3xl font-medium text-foreground">{strong}</strong>
              <span className="text-small text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <SoftCard padding="md">
            <p className="font-eyebrow text-primary">Brain Dump · 09:41</p>
            <p className="mt-3 font-serif text-small leading-relaxed text-foreground">
              Finish landing copy. Book dentist. Ask Sam about Convex. Pick up groceries. Am I shipping fast
              enough?
            </p>
          </SoftCard>
          <SoftCard padding="md" className="bg-primary text-primary-foreground">
            <p className="font-eyebrow text-primary-foreground/85">Coach</p>
            <h2 className="mt-2 font-serif text-xl font-medium">Three things look doable this afternoon.</h2>
            <p className="mt-2 text-small leading-relaxed text-primary-foreground/85">
              I pulled them from your dump. The worry I left on the side — we&apos;ll look at it tomorrow.
            </p>
          </SoftCard>
        </div>

        <section className="mt-20 border-t border-border-soft pt-16" id="features">
          <p className="font-eyebrow text-primary">What&apos;s inside</p>
          <h2 className="mt-3 max-w-[18ch] font-serif text-[clamp(2rem,4.4vw,3.6rem)] font-normal leading-tight tracking-tight">
            Tasks, notes, and calendar — one markdown page per day.
          </h2>
          <p className="mt-4 max-w-[62ch] font-serif text-xl leading-relaxed text-muted-foreground">
            Dump, sort, plan, do, reflect — in a single plaintext file you actually own. Linked, searchable,
            yours forever.
          </p>
        </section>

        <section className="mt-16 bg-surface-inverse px-6 py-16 text-cream md:rounded-2xl md:px-10" id="coach">
          <h2 className="font-serif text-3xl font-normal">Coach samples</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <CoachBubble className="max-w-none border-border-soft bg-card/10 text-cream" bubbleRole="coach">
              Morning. I noticed you dumped seven things earlier. Want me to stage the tasks first?
            </CoachBubble>
            <CoachBubble className="max-w-none border-border-soft bg-card/10 text-cream" bubbleRole="coach">
              Five things feels full but fine. If the afternoon wobbles, the founder questions can slide to
              Friday.
            </CoachBubble>
            <CoachBubble className="max-w-none border-border-soft bg-card/10 text-cream" bubbleRole="coach">
              Always. One small note — you&apos;ve mentioned shipping speed three times this week.
            </CoachBubble>
          </div>
        </section>

        <footer className="mt-20 border-t border-border-soft pt-10">
          <div className="flex flex-wrap gap-6">
            <Link href="/about" className="text-small text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/changelog" className="text-small text-muted-foreground hover:text-foreground">
              Changelog
            </Link>
            <Link href="/privacy" className="text-small text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-small text-muted-foreground hover:text-foreground">
              Terms
            </Link>
          </div>
          <p className="mt-6 max-w-md font-serif text-lg text-muted-foreground">
            Built slowly, on cream paper, for brains that need a softer operating system.
          </p>
        </footer>
      </section>
    </main>
  );
}
