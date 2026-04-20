import Link from "next/link";
import { Pill, SoftCard } from "@tempo/ui/primitives";

/**
 * @screen: changelog
 * @category: Marketing
 * @source: docs/design/claude-export/design-system/changelog.html
 * @summary: Shipping notes, quiet and chronological.
 * @auth: public
 */
const releases = [
  { version: "1.0.0-rc", date: "April 2026", notes: ["42 web screens scaffolded", "Convex soft-delete indexes"] },
  { version: "0.9.0", date: "March 2026", notes: ["Brain dump RAM-only rule enforced", "Coach warmth dial"] },
] as const;

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-small text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
      <h1 className="mt-6 text-h1 font-serif text-foreground">Changelog</h1>
      <p className="mt-2 text-body text-muted-foreground">Quiet shipping notes. Newest first.</p>
      <ul className="mt-10 space-y-6">
        {releases.map((r) => (
          <li key={r.version}>
            <SoftCard padding="md">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-xl text-foreground">{r.version}</h2>
                <Pill tone="slate">{r.date}</Pill>
              </div>
              <ul className="mt-3 list-inside list-disc text-small text-muted-foreground">
                {r.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </SoftCard>
          </li>
        ))}
      </ul>
    </main>
  );
}
