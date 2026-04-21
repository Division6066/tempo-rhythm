import Link from "next/link";
import { BrandMark, Wordmark } from "@tempo/ui/brand";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";

/**
 * @screen: about
 * @category: Marketing
 * @owner: cursor-cloud-3
 * @prd: PRD §14
 * @source: docs/design/claude-export/design-system/about.html
 * @summary: Founder bio + product philosophy + facts strip.
 * @auth: public
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-[var(--container-tempo)] items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </Link>
        <div className="flex items-center gap-2">
          {/*
           * @behavior: Back to marketing landing.
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
          <Pill tone="orange">About Tempo</Pill>
          <h1 className="font-display leading-[1.04]">
            I built this for my brain.
            <br />
            <em className="tempo-gradient-text not-italic">Maybe yours too.</em>
          </h1>
          <p className="font-serif text-h3 leading-relaxed text-muted-foreground">
            Tempo Flow is overwhelm-first by design. We believe good tools for
            ADHD, autistic, and neurodivergent brains should never shame you
            for being yourself.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow">Anti-shame</div>
            <p className="mt-2 text-body text-muted-foreground">
              No streaks that reset. No "you missed a day" nudges. Missed days
              are allowed to rest.
            </p>
          </SoftCard>
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow">Accept before apply</div>
            <p className="mt-2 text-body text-muted-foreground">
              Every AI suggestion surfaces an accept / tweak / reject card. We
              never silently mutate your data.
            </p>
          </SoftCard>
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow">RAM-only capture</div>
            <p className="mt-2 text-body text-muted-foreground">
              Brain dumps, voice transcripts, and third-party imports stay in
              memory until you approve what lands.
            </p>
          </SoftCard>
        </div>

        <SoftCard tone="sunken" padding="lg" className="mt-12 max-w-2xl">
          <div className="font-eyebrow">Facts strip</div>
          <ul className="mt-3 flex flex-col gap-2 text-small">
            <li>Built in the open — MIT license.</li>
            <li>Backend: Convex (reactive DB + auth + functions).</li>
            <li>LLMs: OpenRouter only. No direct provider SDKs.</li>
            <li>Payments: RevenueCat. No direct Stripe.</li>
            <li>Mobile: Expo + React Native, PWA on web.</li>
          </ul>
        </SoftCard>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          {/*
           * @behavior: Start onboarding from About CTA.
           * @navigate: /onboarding
           */}
          <Link href="/onboarding">
            <Button variant="primary" size="lg">
              Start your seven-day walk — $1
            </Button>
          </Link>
          {/*
           * @behavior: Jump into demo preview.
           * @navigate: /today
           */}
          <Link href="/today">
            <Button variant="soft" size="lg">
              Preview the app →
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
