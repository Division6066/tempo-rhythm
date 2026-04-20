import Link from "next/link";
import { SoftCard } from "@tempo/ui/primitives";

/**
 * @screen: about
 * @category: Marketing
 * @source: docs/design/claude-export/design-system/about.html
 * @summary: Founder bio, facts, philosophy.
 * @auth: public
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-small text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
      <h1 className="mt-6 text-h1 font-serif text-foreground">About Tempo Flow</h1>
      <p className="mt-4 text-body leading-relaxed text-muted-foreground">
        Tempo is an overwhelm-first planner: brain dump, gentle sort, small plans, and a coach that never
        shames you for capacity.
      </p>
      <SoftCard padding="lg" className="mt-10">
        <p className="font-serif text-lg leading-relaxed text-foreground">
          I built Tempo because I needed a tool that treated low-spoons days as normal, not as failure. The
          product is opinionated about warmth, consent, and undo — every AI change is a proposal you accept.
        </p>
        <p className="mt-4 font-serif text-lg italic text-muted-foreground">— Amit</p>
      </SoftCard>
      {/*
        @action aboutContact
        @navigate: /contact
        @auth: public
      */}
      <Link
        href="/contact"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-body font-medium text-foreground hover:bg-surface-sunken"
      >
        Contact
      </Link>
    </main>
  );
}
