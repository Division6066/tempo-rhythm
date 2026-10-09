import { BrandMark, Wordmark } from "@tempo/ui/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/marketing/ThemeToggle";
import { getLandingCopy } from "@/lib/landing-copy";

/**
 * Public marketing page.
 * @source docs/design/claude-export/design-system/landing.html
 * @auth public for signed-out visitors. Signed-in "/" is redirected to /today.
 *
 * landing.html has no FAQ section (the design README mentions one). This page
 * ports the sections that file actually contains.
 * Account buttons go to /sign-in and /sign-up. No payment form.
 */

const copy = getLandingCopy("en");

export const metadata: Metadata = copy.metadata;

const wrap = "mx-auto w-full max-w-[1240px] px-6 md:px-8";

const ctaPrimary =
  "inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-small font-medium text-cream hover:brightness-105";
const ctaGradient =
  "inline-flex items-center justify-center rounded-full tempo-gradient px-6 py-3.5 text-small font-medium text-cream hover:brightness-105";
const ctaGhost =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-small font-medium text-foreground hover:bg-surface-sunken";
const ctaOnDark =
  "inline-flex items-center justify-center rounded-full bg-cream px-6 py-3.5 text-small font-semibold text-tempo-orange hover:brightness-105";

const eyebrow =
  "font-mono text-caption font-semibold uppercase tracking-[0.16em] text-tempo-orange";
const sectionTitle =
  "mt-3 max-w-[18ch] font-serif text-[clamp(2rem,4.4vw,3.625rem)] font-normal leading-[1.08] tracking-tight";
const sectionLede = "mt-5 max-w-[62ch] font-serif text-h3 leading-relaxed text-muted-foreground";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className={`${wrap} flex flex-wrap items-center gap-4 py-6 md:gap-8`}>
        <Link href="/" className="flex items-center gap-3" aria-label={copy.nav.homeLabel}>
          <BrandMark size={32} />
          <Wordmark size={22} />
        </Link>
        <div className="ml-auto hidden items-center gap-6 text-small text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            {copy.nav.features}
          </a>
          <a href="#coach" className="hover:text-foreground">
            {copy.nav.coach}
          </a>
          <a href="#pricing" className="hover:text-foreground">
            {copy.nav.pricing}
          </a>
          <a href="#letter" className="hover:text-foreground">
            {copy.nav.manifesto}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/sign-in" className={ctaGhost}>
            {copy.nav.signIn}
          </Link>
          <Link href="/sign-up" className={ctaGhost}>
            {copy.nav.signUp}
          </Link>
          <Link href="/sign-up" className={`${ctaPrimary} px-4 py-2`}>
            {copy.nav.joinBeta}
          </Link>
        </div>
      </nav>

      <main>
        <header className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-12">
          <div className={`${wrap} relative z-[2]`}>
            <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-small text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-tempo-orange" aria-hidden />
              {copy.hero.badge}
            </p>
            <h1 className="max-w-[12ch] font-serif text-[clamp(2.75rem,6.8vw,5.75rem)] font-normal leading-[1.02] tracking-tight">
              {copy.hero.titleBefore}
              <em className="italic text-tempo-orange">{copy.hero.titleEmphasis}</em>
              <br />
              {copy.hero.titleAfter}
            </h1>
            <p className="mt-6 max-w-[54ch] font-serif text-[clamp(1.125rem,1.8vw,1.5rem)] leading-relaxed text-muted-foreground">
              {copy.hero.lede}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/sign-up" className={ctaGradient}>
                {copy.nav.joinBeta}
              </Link>
              <Link href="/sign-up" className={ctaGhost}>
                {copy.nav.signUp}
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-10">
              {copy.hero.proof.map(([value, label]) => (
                <div key={label}>
                  <dt className="font-serif text-[28px] font-medium leading-none">{value}</dt>
                  <dd className="mt-1 text-small text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-[-120px] hidden w-[48%] lg:block"
            aria-hidden
          >
            <article className="absolute left-5 top-10 w-[280px] -rotate-3 rounded-xl border border-border bg-card p-4 shadow-lift">
              <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-tempo-orange">
                {copy.hero.brainDumpLabel}
              </p>
              <p className="font-serif text-[15px] leading-relaxed">
                {copy.hero.brainDump}
              </p>
            </article>
            <article className="absolute left-[180px] top-[180px] w-[300px] rotate-2 rounded-xl tempo-gradient p-4 text-cream shadow-lift">
              <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-cream/85">
                {copy.hero.coachLabel}
              </p>
              <p className="mb-1.5 font-serif text-h3 font-medium text-cream">
                {copy.hero.coachTitle}
              </p>
              <p className="text-small leading-relaxed text-cream/85">
                {copy.hero.coachBody}
              </p>
            </article>
            <article className="absolute left-[60px] top-[380px] w-[260px] -rotate-2 rounded-xl border border-border bg-card p-4 shadow-lift">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-tempo-orange">
                {copy.hero.streakLabel}
              </p>
              <div className="my-2 flex gap-1.5">
                {["a", "b", "c", "d", "e"].map((day) => (
                  <span key={day} className="h-7 w-7 rounded-md bg-moss" />
                ))}
                {["f", "g"].map((day) => (
                  <span key={day} className="h-7 w-7 rounded-md bg-surface-sunken" />
                ))}
              </div>
              <p className="text-small">{copy.hero.streakBody}</p>
            </article>
          </div>
        </header>

        <section id="features" className="py-10 md:py-16">
          <div className={wrap}>
            <p className={eyebrow}>{copy.features.eyebrow}</p>
            <h2 className={sectionTitle}>
              {copy.features.title}
            </h2>
            <p className={sectionLede}>
              {copy.features.lede}
            </p>

            <div className="mt-8 grid items-center gap-8 rounded-xl bg-mkt-dark-bg p-8 text-mkt-dark-fg md:grid-cols-2">
              <div>
                <p className={eyebrow}>{copy.features.dailyNote.eyebrow}</p>
                <h3 className="my-3 font-serif text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-tight tracking-tight text-mkt-dark-fg">
                  {copy.features.dailyNote.title}
                </h3>
                <p className="text-body leading-relaxed text-mkt-dark-fg-muted">
                  {copy.features.dailyNote.body}
                </p>
                <p className="mt-5 flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-[0.08em] text-mkt-dark-fg-subtle">
                  <span>{copy.features.dailyNote.links}</span>
                  <span>{copy.features.dailyNote.commandBar}</span>
                  <span>{copy.features.dailyNote.tags}</span>
                </p>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-card p-5 font-mono text-caption leading-[1.9] text-foreground shadow-lift">
                <span className="block text-muted-foreground">{copy.features.dailyNote.sample[0]}</span>
                <span className="block text-tempo-orange">{copy.features.dailyNote.sample[1]}</span>
                <span className="block">{copy.features.dailyNote.sample[2]}</span>
                <span className="mt-2 block text-tempo-orange">{copy.features.dailyNote.sample[3]}</span>
                <span className="block">{copy.features.dailyNote.sample[4]}</span>
                <span className="block">{copy.features.dailyNote.sample[5]}</span>
                <span className="block">{copy.features.dailyNote.sample[6]}</span>
                <span className="mt-2 block text-tempo-orange">{copy.features.dailyNote.sample[7]}</span>
                <span className="block text-muted-foreground">
                  {copy.features.dailyNote.sample[8]}
                </span>
              </pre>
            </div>

            <div className="mt-10 grid grid-cols-12 gap-6">
              <article className="relative col-span-12 min-h-[260px] overflow-hidden rounded-xl border border-border bg-[linear-gradient(145deg,var(--color-cream-raised),var(--color-cream-deep))] p-6 lg:col-span-7 lg:min-h-[420px]">
                <p className="font-mono text-caption font-semibold uppercase tracking-[0.16em] text-amber">
                  {copy.features.brainDump.eyebrow}
                </p>
                <h3 className="my-2 font-serif text-[26px] font-medium tracking-tight">
                  {copy.features.brainDump.title}
                </h3>
                <p className="max-w-[36ch] text-small leading-relaxed text-muted-foreground">
                  {copy.features.brainDump.body}
                </p>
                <div className="mt-6 rounded-lg bg-card p-4 shadow-lift lg:absolute lg:bottom-[-20px] lg:right-[-20px] lg:w-[60%]">
                  <p className="mb-2 font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                    {copy.features.brainDump.sortedLabel}
                  </p>
                  <ul className="flex flex-col gap-1.5 text-small">
                    <li className="flex justify-between gap-3 rounded-md bg-surface-sunken px-2.5 py-2">
                      <span>{copy.features.brainDump.items[0][0]}</span>
                      <span className="font-mono text-[10px] text-tempo-orange">{copy.features.brainDump.items[0][1]}</span>
                    </li>
                    <li className="flex justify-between gap-3 rounded-md bg-surface-sunken px-2.5 py-2">
                      <span>{copy.features.brainDump.items[1][0]}</span>
                      <span className="font-mono text-[10px] text-tempo-orange">
                        {copy.features.brainDump.items[1][1]}
                      </span>
                    </li>
                    <li className="flex justify-between gap-3 rounded-md bg-surface-sunken px-2.5 py-2">
                      <span>{copy.features.brainDump.items[2][0]}</span>
                      <span className="font-mono text-[10px] text-amber">{copy.features.brainDump.items[2][1]}</span>
                    </li>
                  </ul>
                </div>
              </article>

              <article className="col-span-12 min-h-[260px] rounded-xl border border-border bg-card p-6 lg:col-span-5">
                <p className={eyebrow}>{copy.features.coach.eyebrow}</p>
                <h3 className="my-2 font-serif text-[26px] font-medium tracking-tight">
                  {copy.features.coach.title}
                </h3>
                <p className="text-small leading-relaxed text-muted-foreground">
                  {copy.features.coach.body}
                </p>
                <p className="mt-5 rounded-[10px] bg-surface-sunken p-3 font-serif text-small italic leading-relaxed">
                  {copy.features.coach.quote}
                </p>
              </article>

              <article className="col-span-12 min-h-[260px] rounded-xl bg-mkt-dark-bg p-6 text-mkt-dark-fg">
                <p className={eyebrow}>{copy.features.firstPlan.eyebrow}</p>
                <h3 className="my-2 max-w-[24ch] font-serif text-[26px] font-medium tracking-tight text-mkt-dark-fg">
                  {copy.features.firstPlan.title}
                </h3>
                <p className="max-w-[54ch] text-small leading-relaxed text-mkt-dark-fg-muted">
                  {copy.features.firstPlan.body}
                </p>
              </article>

              <article className="col-span-12 min-h-[220px] rounded-xl border border-border bg-card p-6 md:col-span-4">
                <p className={eyebrow}>{copy.features.journal.eyebrow}</p>
                <h3 className="my-2 font-serif text-[26px] font-medium tracking-tight">
                  {copy.features.journal.title}
                </h3>
                <p className="text-small leading-relaxed text-muted-foreground">
                  {copy.features.journal.body}
                </p>
              </article>
              <article className="col-span-12 min-h-[220px] rounded-xl border border-border bg-card p-6 md:col-span-4">
                <p className={eyebrow}>{copy.features.routines.eyebrow}</p>
                <h3 className="my-2 font-serif text-[26px] font-medium tracking-tight">
                  {copy.features.routines.title}
                </h3>
                <p className="text-small leading-relaxed text-muted-foreground">
                  {copy.features.routines.body}
                </p>
              </article>
              <article className="col-span-12 min-h-[220px] rounded-xl border border-border bg-card p-6 md:col-span-4">
                <p className={eyebrow}>{copy.features.weekly.eyebrow}</p>
                <h3 className="my-2 font-serif text-[26px] font-medium tracking-tight">
                  {copy.features.weekly.title}
                </h3>
                <p className="text-small leading-relaxed text-muted-foreground">
                  {copy.features.weekly.body}
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="coach" className="bg-mkt-dark-bg py-16 text-mkt-dark-fg md:py-20">
          <div className={wrap}>
            <p className={eyebrow}>{copy.coach.eyebrow}</p>
            <h2 className={`${sectionTitle} text-mkt-dark-fg`}>
              {copy.coach.title}
            </h2>
            <p className="mt-5 max-w-[62ch] font-serif text-h3 leading-relaxed text-mkt-dark-fg-muted">
              {copy.coach.lede}
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {copy.coach.quotes.map((item) => (
                <blockquote
                  key={item.caption}
                  className="rounded-lg border border-mkt-dark-border bg-mkt-dark-bubble p-5 font-serif text-h3 leading-relaxed text-mkt-dark-fg"
                >
                  {item.quote}
                  <span className="mt-4 block font-mono text-[11px] uppercase tracking-[0.08em] text-mkt-dark-fg-subtle">
                    {item.caption}
                  </span>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-16 md:py-20">
          <div className={wrap}>
            <p className={eyebrow}>{copy.pricing.eyebrow}</p>
            <h2 className={sectionTitle}>{copy.pricing.title}</h2>
            <p className={sectionLede}>{copy.pricing.lede}</p>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <article className="rounded-xl border border-border bg-card p-8">
                <p className="mb-4 font-mono text-caption uppercase tracking-[0.12em] opacity-70">
                  {copy.pricing.beta.label}
                </p>
                <p className="font-serif text-[64px] font-medium leading-none">
                  {copy.pricing.beta.price}
                  <span className="font-sans text-h3 font-normal text-muted-foreground">
                    {" "}
                    {copy.pricing.beta.suffix}
                  </span>
                </p>
                <p className="my-6 text-small leading-relaxed">
                  {copy.pricing.beta.body}
                </p>
                <ul className="mb-6 space-y-2 text-small leading-8">
                  {copy.pricing.beta.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-tempo-orange" aria-hidden>
                        →
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className={ctaPrimary}>
                  {copy.pricing.beta.cta}
                </Link>
              </article>
              <article className="relative rounded-xl bg-gradient-to-br from-mkt-dark-bg to-mkt-dark-bg-2 p-8 text-mkt-dark-fg">
                <p className="absolute right-5 top-5 rounded-full bg-tempo-orange px-2.5 py-1 text-[11px] font-semibold text-cream">
                  {copy.pricing.included.badge}
                </p>
                <p className="mb-4 font-mono text-caption uppercase tracking-[0.12em] text-mkt-dark-fg-subtle">
                  {copy.pricing.included.label}
                </p>
                <p className="font-serif text-[64px] font-medium leading-none">
                  {copy.pricing.included.price}
                  <span className="font-sans text-h3 font-normal text-mkt-dark-fg-muted">
                    {" "}
                    {copy.pricing.included.suffix}
                  </span>
                </p>
                <p className="my-6 text-small leading-relaxed">
                  {copy.pricing.included.body}
                </p>
                <ul className="mb-6 space-y-2 text-small leading-8">
                  {copy.pricing.included.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-tempo-orange" aria-hidden>
                        →
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className={ctaGradient}>
                  {copy.pricing.included.cta}
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className={wrap}>
            <p className={eyebrow}>{copy.testimonials.eyebrow}</p>
            <h2 className={sectionTitle}>{copy.testimonials.title}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {copy.testimonials.items.map((item) => (
                <figure key={item.name} className="rounded-lg border border-border bg-card p-6">
                  <blockquote className="font-serif text-h3 leading-relaxed">
                    {item.quote}
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-2.5 text-small">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full tempo-gradient font-serif text-cream">
                      {item.initial}
                    </span>
                    <span className="font-medium">
                      {item.name}
                      <span className="block text-caption font-normal text-muted-foreground">
                        {item.role}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="letter" className="bg-surface-sunken py-16 md:py-20">
          <div className={wrap}>
            <article className="mx-auto max-w-[780px] rounded-2xl border border-border bg-card p-8 md:p-12">
              <p className={eyebrow}>{copy.letter.eyebrow}</p>
              <h2 className="mt-3 font-serif text-[36px] font-normal leading-tight tracking-tight">
                {copy.letter.title}
              </h2>
              <div className="mt-4 space-y-4 font-serif text-[19px] leading-[1.7]">
                {copy.letter.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p className="pt-2 font-serif text-[28px] italic">{copy.letter.signature}</p>
              </div>
            </article>
          </div>
        </section>

        <section className="tempo-gradient py-16 text-center text-cream md:py-20">
          <div className={wrap}>
            <h2 className="mx-auto max-w-[20ch] font-serif text-[clamp(2rem,4.4vw,3.625rem)] font-normal leading-[1.08] tracking-tight text-cream">
              {copy.finalCta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-[62ch] font-serif text-h3 leading-relaxed text-cream/90">
              {copy.finalCta.body}
            </p>
            <Link href="/sign-up" className={`${ctaOnDark} mt-8`}>
              {copy.finalCta.cta}
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-mkt-dark-bg py-12 text-mkt-dark-fg">
        <div className={wrap}>
          <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <BrandMark size={28} />
                <Wordmark size={22} color="var(--color-mkt-dark-fg)" />
              </div>
              <p className="max-w-[30ch] font-serif text-h3 leading-relaxed text-mkt-dark-fg-muted">
                {copy.footer.tagline}
              </p>
            </div>
            <div>
              <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mkt-dark-fg-subtle">
                {copy.footer.product}
              </h2>
              <a
                href="#features"
                className="block text-small leading-8 text-mkt-dark-fg-muted hover:text-mkt-dark-fg"
              >
                {copy.footer.features}
              </a>
              <a
                href="#coach"
                className="block text-small leading-8 text-mkt-dark-fg-muted hover:text-mkt-dark-fg"
              >
                {copy.footer.coach}
              </a>
              <a
                href="#pricing"
                className="block text-small leading-8 text-mkt-dark-fg-muted hover:text-mkt-dark-fg"
              >
                {copy.footer.pricing}
              </a>
              <Link
                href="/sign-up"
                className="block text-small leading-8 text-mkt-dark-fg-muted hover:text-mkt-dark-fg"
              >
                {copy.footer.signUp}
              </Link>
            </div>
            <div>
              <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mkt-dark-fg-subtle">
                {copy.footer.legal}
              </h2>
              <Link
                href="/privacy"
                className="block text-small leading-8 text-mkt-dark-fg-muted hover:text-mkt-dark-fg"
              >
                {copy.footer.privacy}
              </Link>
              <Link
                href="/terms"
                className="block text-small leading-8 text-mkt-dark-fg-muted hover:text-mkt-dark-fg"
              >
                {copy.footer.terms}
              </Link>
              <Link
                href="/contact"
                className="block text-small leading-8 text-mkt-dark-fg-muted hover:text-mkt-dark-fg"
              >
                {copy.footer.contact}
              </Link>
              <a
                href="mailto:amit@tempoflow.app"
                className="block text-small leading-8 text-mkt-dark-fg-muted hover:text-mkt-dark-fg"
              >
                {copy.footer.email}
              </a>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-mkt-dark-border pt-6 font-mono text-caption text-mkt-dark-fg-subtle">
            <span>{copy.footer.copyright}</span>
            <span>{copy.footer.version}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
