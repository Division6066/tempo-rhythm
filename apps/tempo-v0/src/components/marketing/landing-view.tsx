import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";

export function LandingView() {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <SiteHeader />
      <header className="px-6 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
        <div className="mx-auto grid max-w-[1240px] items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-muted">
              <span className="size-1.5 rounded-full bg-accent" />
              1.0 ships · closed beta open now
            </p>
            <h1 className="font-display text-[44px] font-normal leading-[1.05] tracking-[-0.03em] md:text-[72px]">
              A planner that won't <em className="italic text-accent">shame</em> your nervous system.
            </h1>
            <p className="mt-6 max-w-[54ch] font-display text-lg leading-relaxed text-muted md:text-2xl">
              Tempo Flow is a calm planner for ADHD brains, autistic brains, anxious brains, and anyone
              who's tried seventeen productivity apps and bounced off all of them. Dump your thoughts.
              We'll help you find the next doable thing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild variant="gradient" size="xl">
                <Link to="/onboarding">Start your seven-day week · $1</Link>
              </Button>
              <Button asChild variant="ghost" size="xl">
                <Link to="/daily-note">Try the daily note →</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-10">
              <Stat n="42" l="handcrafted screens" />
              <Stat n="1" l="person, one year" />
              <Stat n="$1" l="week-long trial" />
              <Stat n="0" l="guilt trips, ever" />
            </div>
          </div>
          <div className="relative hidden min-h-[520px] lg:block" aria-hidden>
            <HeroCard className="top-4 left-4 w-[280px] -rotate-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">Brain Dump · 09:41</p>
              <p className="font-display text-[15px] leading-relaxed">
                Finish landing copy. Book dentist. Ask Sam about the schema. Pick up groceries. Am I shipping fast enough?
              </p>
            </HeroCard>
            <HeroCard className="top-40 left-36 w-[300px] rotate-2 tempo-gradient text-accent-fg">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-fg/80">Coach</p>
              <h3 className="mb-1.5 font-display text-lg font-medium">Three things look doable this afternoon.</h3>
              <p className="text-[13px] leading-relaxed text-accent-fg/85">
                I pulled them from your dump. The worry I left on the side — we'll look at it tomorrow.
              </p>
            </HeroCard>
            <HeroCard className="top-[360px] left-10 w-[260px] -rotate-2">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">Today · three things</p>
              <div className="my-2 space-y-1.5 text-[13px]">
                <p>* [x] Morning pages</p>
                <p>* [ ] Draft the next small thing @09:30</p>
                <p>* [ ] Ten-minute walk @12:30</p>
              </div>
              <p className="text-[13px] text-muted">Two parked for tomorrow. That's allowed.</p>
            </HeroCard>
          </div>
        </div>
      </header>

      <section id="features" className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">What's inside</p>
          <h2 className="max-w-[18ch] font-display text-[32px] font-normal leading-[1.08] tracking-tight md:text-[58px]">
            Tasks, notes, and calendar — one markdown page per day.
          </h2>
          <p className="mt-5 max-w-[62ch] font-display text-xl leading-relaxed text-muted">
            Dump, sort, plan, do, reflect — in a single plaintext file you actually own. Linked, searchable, yours.
          </p>

          <div className="mt-10 rounded-2xl bg-mkt-bg p-6 text-mkt-fg md:grid md:grid-cols-2 md:gap-8 md:p-8">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">Daily Note</p>
              <h3 className="mt-3 max-w-[20ch] font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
                Markdown-native. Bi-directionally linked. Gently animated.
              </h3>
              <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-mkt-muted">
                A focus ring that breathes. Task completes that stay quiet. Time blocks that pulse where you are right now.
              </p>
              <div className="mt-5 flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-[0.08em] text-mkt-subtle">
                <span>[[ bi-di links ]]</span>
                <span>command bar</span>
                <span>#tags · @people</span>
              </div>
            </div>
            <pre className="mt-6 overflow-x-auto rounded-lg bg-surface p-5 font-mono text-xs leading-[1.9] text-ink shadow-(--shadow-lift) md:mt-0">
              <span className="text-muted"># Thursday · April 23</span>
              {"\n"}
              <span className="text-accent">## Intentions</span>
              {"\n"}Ship launch post by noon. Protect the afternoon.
              {"\n"}
              <span className="text-accent">## Tasks</span>
              {"\n"}* [x] Morning pages — [[Journal]]
              {"\n"}* [ ] Draft launch post @09:30 #writing
              {"\n"}* [ ] Ten-minute walk @12:30
              {"\n"}
              <span className="text-accent">## Notes</span>
              {"\n"}
              <span className="text-muted">Sam replied on [[Schema notes]]...</span>
            </pre>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-12">
            <article className="tempo-feat-warm relative min-h-[320px] overflow-hidden rounded-2xl border border-border p-6 md:col-span-7 md:min-h-[420px]">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-amber">01 — Brain Dump</p>
              <h3 className="mt-4 font-display text-[26px] font-medium tracking-tight">
                Empty your head onto the page. We'll do the sorting.
              </h3>
              <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-muted">
                Write everything — tasks, worries, ideas — in one messy stream. No format to learn, no tags to choose.
              </p>
              <div className="mt-6 rounded-lg border border-border bg-surface p-4 shadow-(--shadow-lift) md:absolute md:right-[-12px] md:bottom-[-12px] md:w-[60%]">
                <p className="mb-2 font-mono text-[10px] tracking-[0.08em] text-muted">SORTED · 6 ITEMS</p>
                <div className="space-y-1.5 text-[13px]">
                  <SortRow label="TASK" text="Finish landing copy" />
                  <SortRow label="TASK" text="Book dentist" />
                  <SortRow label="WORRY" text="Am I shipping fast enough?" tone="amber" />
                </div>
              </div>
            </article>
            <article className="rounded-2xl border border-border bg-surface p-6 md:col-span-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">02 — Coach</p>
              <h3 className="mt-4 font-display text-[26px] font-medium tracking-tight">
                A voice that checks in, not checks up.
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Tap a warmth dial from 0 (businesslike) to 10 (your kindest friend). The coach reads your dump, suggests a plan, and stays quiet when you don't need it.
              </p>
              <p className="mt-6 rounded-md bg-surface-2 p-3 font-display text-sm italic leading-relaxed">
                "Three doable things. The rest can wait."
              </p>
            </article>
            <article className="rounded-2xl bg-mkt-bg p-6 text-mkt-fg md:col-span-12">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">03 — First Plan</p>
              <h3 className="mt-3 max-w-[24ch] font-display text-[26px] font-medium tracking-tight">
                A three-block day, already scheduled. You can still say no.
              </h3>
              <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-mkt-muted">
                Drag to rearrange. Tap to skip. High-focus before noon, soft blocks after three, zero guilt if you close the laptop.
              </p>
            </article>
            <MiniFeat n="04" title="Journal" body="Prompts that fit your day. Never a red streak warning." />
            <MiniFeat n="05" title="Study" body="Cards, fill-in blanks, a three-question quiz, a Why? button, a tutor on the page. Twelve minutes is a session." />
            <MiniFeat n="06" title="Map" body="One idea, one card. Wiki lines draw themselves. Ask about a card. Cluster, then learn the cluster." />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-surface p-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">Daily note</p>
              <h3 className="mt-3 font-display text-2xl font-medium tracking-tight">Calendar, markdown, timeline.</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                One page per day. Drag a task onto an hour. Week, month, and year notes sit beside it. Slash commands
                insert JSON templates as markdown. Review lists every open checkbox — three at a time.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-surface p-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">Study</p>
              <h3 className="mt-3 font-display text-2xl font-medium tracking-tight">From the page, not a course pack.</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Coach turns **term** — definition lines into cards. Miss a quiz answer and ask why. Matching round if flipping feels like too much.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-surface p-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">Map</p>
              <h3 className="mt-3 font-display text-2xl font-medium tracking-tight">A whiteboard that stays a file.</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Cards are notes. [[links]] are lines. Ask coach to cluster. OpenDyslexic, a reading ruler, and focus mode if the chrome is too much.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="coach" className="bg-mkt-bg px-6 py-16 text-mkt-fg md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">The coach</p>
          <h2 className="max-w-[18ch] font-display text-[32px] font-normal leading-[1.08] tracking-tight md:text-[58px]">
            It sounds like a person who's met you before.
          </h2>
          <p className="mt-5 max-w-[62ch] font-display text-xl leading-relaxed text-mkt-muted">
            Warmth dial set to 6 by default. Moves lower when you're heads-down, higher when the dump feels anxious.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["You finished two of three yesterday. That counts. Want to start with the unfinished one, or a lighter warm-up?", "Monday · 09:12 · warmth 6"],
              ["The dump looks heavy today. Three items feel like worries, not tasks. Want to park them, or look at one?", "Wednesday · 08:40 · warmth 7"],
              ["You protected the afternoon yesterday. That was a hard call. Noting it.", "Friday · evening recap · warmth 5"],
            ].map(([quote, who]) => (
              <blockquote
                key={who}
                className="rounded-lg border border-mkt-border bg-mkt-bubble p-5 font-display text-lg leading-relaxed"
              >
                "{quote}"
                <span className="mt-4 block font-mono text-[11px] uppercase tracking-[0.08em] text-mkt-subtle">{who}</span>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">Pricing</p>
          <h2 className="max-w-[18ch] font-display text-[32px] font-normal leading-[1.08] tracking-tight md:text-[58px]">
            One dollar for a week. Then a fair price, forever.
          </h2>
          <p className="mt-5 max-w-[62ch] font-display text-xl leading-relaxed text-muted">
            No free tier — free planners become abandoned planners. A dollar is enough of a commitment to matter.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-8">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-muted">The seven-day week</p>
              <p className="font-display text-[64px] font-medium leading-none">
                $1<span className="align-middle font-sans text-lg font-normal text-muted"> · once</span>
              </p>
              <p className="mt-3 mb-6 text-[15px] leading-relaxed text-muted">
                Seven full days of every feature. If it doesn't fit, you've lost a dollar and a Tuesday.
              </p>
              <ul className="mb-6 space-y-1 text-sm leading-8">
                {["All screens, unlocked", "Coach · warmth dial · voice", "Web, on this device", "No auto-enrollment"].map((x) => (
                  <li key={x}>
                    <span className="text-accent">→ </span>
                    {x}
                  </li>
                ))}
              </ul>
              <Button asChild variant="default" size="xl">
                <Link to="/onboarding">Start my week →</Link>
              </Button>
            </div>
            <div className="relative rounded-2xl bg-linear-to-br from-mkt-bg to-mkt-bg-2 p-8 text-mkt-fg">
              <span className="absolute top-5 right-5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-fg">
                After your week
              </span>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-mkt-subtle">Tempo Pro</p>
              <p className="font-display text-[64px] font-medium leading-none">
                $9<span className="align-middle font-sans text-lg font-normal text-mkt-subtle"> / month · or $72/year</span>
              </p>
              <p className="mt-3 mb-6 text-[15px] leading-relaxed text-mkt-muted">
                The full thing, forever. Cancel in two taps. Student and unemployed tiers — just ask.
              </p>
              <ul className="mb-6 space-y-1 text-sm leading-8">
                {["Everything in the trial", "Unlimited journal + templates", "Cloud sync when you sign in", "Email the founder any time"].map((x) => (
                  <li key={x}>
                    <span className="text-accent">→ </span>
                    {x}
                  </li>
                ))}
              </ul>
              <Button asChild variant="gradient" size="xl">
                <Link to="/sign-up">See billing →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-8">
        <div className="mx-auto max-w-[1240px]">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">Beta testers</p>
          <h2 className="max-w-[18ch] font-display text-[32px] font-normal leading-[1.08] tracking-tight md:text-[58px]">
            Thirty people used it for four weeks. Here's what they said.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["It's the first planner that didn't make me feel like a broken version of a neurotypical person. I used it for 23 out of 28 days. That's a record.", "M", "Mira K.", "Designer · ADHD"],
              ["I pay for Notion and Sunsama and Things. I'd cancel all three for this. The coach understood when I was having a hard week without me having to spell it out.", "J", "Jonah R.", "Engineer · autistic"],
              ["The brain dump is genuinely unreasonable. I've written 3000 words into it in two weeks and none of them are wasted.", "S", "Sana P.", "Writer"],
            ].map(([quote, initial, name, role]) => (
              <figure key={name} className="rounded-lg border border-border bg-surface p-6">
                <blockquote className="mb-4 font-display text-lg leading-relaxed">
                  "{quote}"
                </blockquote>
                <figcaption className="flex items-center gap-2.5 text-[13px]">
                  <span className="grid size-9 place-items-center rounded-full tempo-gradient font-display font-medium text-accent-fg">
                    {initial}
                  </span>
                  <span>
                    <span className="block font-medium">{name}</span>
                    <span className="text-[11px] font-normal text-muted">{role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="letter" className="bg-surface-2 px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[780px] rounded-[24px] border border-border bg-surface px-6 py-12 md:px-12">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">A letter from Amit</p>
          <h2 className="font-display text-3xl font-normal tracking-tight md:text-4xl">Why I built this alone.</h2>
          <div className="mt-6 space-y-4 font-display text-[19px] leading-[1.7]">
            <p>
              I've had sixteen planners. I've paid for eight. I was diagnosed with ADHD at thirty-four, and the thing that surprised me most was not the diagnosis — it was how much software in my life had quietly been shaming me for not being a person I wasn't.
            </p>
            <p>
              Tempo Flow is one person's answer to that. It's small. It doesn't try to be your operating system. It tries to be the friend who texts "what are you doing today?" without judgment.
            </p>
            <p>
              If it works for you, the dollar keeps the lights on. If it doesn't — you've lost a dollar and a week, not a year. That seems fair.
            </p>
            <p className="mt-6 font-display text-[28px] italic">— Amit</p>
          </div>
        </div>
      </section>

      <section className="tempo-gradient px-6 py-16 text-center text-accent-fg md:py-24">
        <h2 className="mx-auto max-w-[20ch] font-display text-[32px] font-normal leading-[1.08] md:text-[58px]">
          One dollar. Seven days. One gentle week.
        </h2>
        <p className="mx-auto mt-4 max-w-[48ch] font-display text-xl text-accent-fg/90">
          No credit card surprises. No newsletter enrollment. No growth loops. Just the app, for a week.
        </p>
        <div className="mt-8">
          <Button asChild variant="inverse" size="xl">
            <Link to="/onboarding">Start my week →</Link>
          </Button>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <strong className="block font-display text-[28px] font-medium">{n}</strong>
      <span className="text-[13px] text-muted">{l}</span>
    </div>
  );
}

function HeroCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`absolute rounded-xl border border-border bg-surface p-4 text-sm shadow-(--shadow-lift) ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function SortRow({ label, text, tone }: { label: string; text: string; tone?: "amber" }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-surface-2 px-2.5 py-2">
      <span>{text}</span>
      <span className={`font-mono text-[10px] ${tone === "amber" ? "text-amber" : "text-accent"}`}>{label}</span>
    </div>
  );
}

function MiniFeat({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-6 md:col-span-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">{n} — {title}</p>
      <h3 className="mt-4 font-display text-[26px] font-medium tracking-tight">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
    </article>
  );
}
