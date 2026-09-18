import { Link, useNavigate } from "@/lib/tempo-graft/router";
import { ArrowLeft, ArrowRight, BookOpen, Check, Leaf, Zap } from "lucide-react";
import { BrandMark, Wordmark } from "@tempo-v0/components/tempo/brand";
import { Button } from "@tempo-v0/components/ui/button";
import { Textarea } from "@tempo-v0/components/ui/textarea";
import { studioStore, useStudio, countWords } from "@tempo-v0/lib/tempo/studio";
import { useTempo } from "@tempo-v0/lib/tempo/use-tempo";
import { cn } from "@tempo-v0/lib/utils";

const STEPS = ["Welcome", "Personalization", "Template", "Brain Dump", "First Plan"] as const;
const TAGS = [
  "ADHD",
  "Autism",
  "Anxiety",
  "Dyslexia",
  "Burnout",
  "Executive dysfunction",
  "CPTSD",
  "Low spoons / chronic",
  "None — just a better system",
];

export function OnboardingView() {
  const studio = useStudio();
  const { adapter } = useTempo();
  const navigate = useNavigate();
  const step = studio.onboarding.step;
  const o = studio.onboarding;

  function setStep(n: number) {
    studioStore.setOnboarding({ step: Math.max(0, Math.min(4, n)) });
  }

  async function finish() {
    const plan = firstPlan(o.dump);
    for (const title of plan) {
      await adapter.createQuick({ title, dueAt: Date.now() });
    }
    studioStore.completeOnboarding();
    navigate({ to: "/today" });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <BrandMark size={24} />
          <Wordmark size="sm" />
        </Link>
        <div className="hidden items-center sm:flex">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={cn(
                  "grid size-5 place-items-center rounded-full font-mono text-[10px] font-semibold",
                  i <= step ? "bg-accent text-accent-fg" : "bg-border text-faint",
                )}
              >
                {i + 1}
              </div>
              {i < 4 ? (
                <div className={cn("h-px w-7", i < step ? "bg-accent" : "bg-border")} />
              ) : null}
            </div>
          ))}
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/today">Skip</Link>
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 md:px-8">
        <div className="w-full max-w-[720px]">
          {step === 0 ? (
            <div className="text-center">
              <div className="mx-auto mb-6 grid size-24 place-items-center rounded-2xl tempo-gradient">
                <BrandMark size={56} tone="inverse" className="text-accent-fg" />
              </div>
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-accent">Welcome</p>
              <h1 className="mx-auto max-w-xl font-display text-4xl font-medium tracking-tight text-pretty md:text-5xl">
                Your brain's operating system.
              </h1>
              <p className="mx-auto mt-4 max-w-[520px] font-display text-xl leading-relaxed text-muted">
                A planner that feels like a letter from a thoughtful friend, not a form to fill. Let's start small.
                What does today want to be?
              </p>
              <Button className="mt-8" variant="gradient" size="lg" onClick={() => setStep(1)}>
                Let's begin
                <ArrowRight className="size-4" />
              </Button>
              <p className="mt-4 text-xs text-faint">Takes four minutes. You can walk away any time.</p>
              <p className="mt-3 text-xs text-faint">
                Already have an account?{" "}
                <Link to="/login" className="text-accent">
                  Sign in
                </Link>
              </p>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <Eyebrow>Personalization · 1 of 5</Eyebrow>
              <h1 className="font-display text-4xl font-medium tracking-tight">Who does this need to work for?</h1>
              <p className="mt-2 mb-8 font-display text-lg text-muted">
                Pick any that describe you. I'll tune the coach and the UI to match. Nothing is public.
              </p>
              <div className="mb-8 grid gap-2 sm:grid-cols-3">
                {TAGS.map((t) => {
                  const on = o.tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const tags = on ? o.tags.filter((x) => x !== t) : [...o.tags, t];
                        studioStore.setOnboarding({ tags });
                      }}
                      className={cn(
                        "flex h-auto items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium",
                        on ? "border-accent bg-accent-soft" : "border-border bg-surface",
                      )}
                    >
                      {t}
                      {on ? <Check className="size-4 text-accent" /> : null}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ChoiceCard
                  label="Energy"
                  value={o.energy}
                  options={[
                    ["morning", "Morning person"],
                    ["evening", "Evening person"],
                    ["variable", "Unpredictable"],
                  ]}
                  onChange={(energy) => studioStore.setOnboarding({ energy: energy as typeof o.energy })}
                />
                <ChoiceCard
                  label="Work style"
                  value={o.work}
                  options={[
                    ["deep", "Deep focus, long blocks"],
                    ["sprint", "Lots of short tasks"],
                    ["mixed", "Mixed, depends on the day"],
                  ]}
                  onChange={(work) => studioStore.setOnboarding({ work: work as typeof o.work })}
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <Eyebrow>Template · 2 of 5</Eyebrow>
              <h1 className="font-display text-4xl font-medium tracking-tight">Pick a starting shape.</h1>
              <p className="mt-2 mb-8 font-display text-lg text-muted">
                You can change this any time, or mix them. I'll pre-populate your first planning session.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { k: "Student" as const, d: "Courses, assignments, exam blocks. Weekly review on Sunday.", Icon: BookOpen },
                  { k: "Builder" as const, d: "Projects with code context. Deep work anchors. Shutdown routine.", Icon: Zap },
                  { k: "Daily Life" as const, d: "Habits, chores, small joys. Gentle pacing for variable days.", Icon: Leaf },
                ].map((c) => (
                  <button
                    key={c.k}
                    type="button"
                    onClick={() => studioStore.setOnboarding({ template: c.k })}
                    className={cn(
                      "rounded-xl border p-6 text-left",
                      o.template === c.k ? "border-accent bg-accent-soft" : "border-border bg-surface",
                    )}
                  >
                    <span className="mb-4 grid size-12 place-items-center rounded-lg tempo-gradient text-accent-fg">
                      <c.Icon className="size-5" />
                    </span>
                    <h3 className="font-display text-[22px]">{c.k}</h3>
                    <p className="mt-1.5 text-sm text-muted">{c.d}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="mt-6 text-sm text-accent"
                onClick={() => studioStore.setOnboarding({ template: "Blank" })}
              >
                Start blank instead
              </button>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <Eyebrow>Brain Dump · 3 of 5</Eyebrow>
              <h1 className="font-display text-4xl font-medium tracking-tight">Tell me everything.</h1>
              <p className="mt-2 mb-6 font-display text-lg text-muted">Don't organize it. Just type. I'll sort it after.</p>
              <div className="rounded-xl border border-border bg-surface p-4">
                <Textarea
                  value={o.dump}
                  onChange={(e) => studioStore.setOnboarding({ dump: e.target.value })}
                  className="min-h-52 border-0 bg-transparent font-display text-lg leading-relaxed"
                />
                <p className="mt-2 text-xs text-faint">{countWords(o.dump)} words</p>
              </div>
              <p className="mt-4 rounded-lg border border-border bg-accent-soft p-4 font-display text-sm leading-relaxed">
                Good. I'll sort this on the next screen and show you what I think goes where. You approve each one.
              </p>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <Eyebrow>First plan · 4 of 5</Eyebrow>
              <h1 className="font-display text-4xl font-medium tracking-tight">Three things for today.</h1>
              <p className="mt-2 mb-8 font-display text-lg text-muted">
                Small and doable. The rest is parked — we'll revisit tomorrow.
              </p>
              <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
                {firstPlan(o.dump).map((title, i) => (
                  <div key={title} className="flex items-center gap-3 rounded-lg bg-surface-2 p-3.5">
                    <span className="grid size-7 place-items-center rounded-full tempo-gradient font-display text-sm font-semibold text-accent-fg">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="font-mono text-[11px] text-muted">{["09:30 · 45 min", "11:45 · 5 min", "12:30 · 10 min"][i]}</p>
                    </div>
                  </div>
                ))}
                <p className="p-2 font-display text-sm text-muted">
                  Looks small on purpose. You can add more after — but let's start here.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Create your account to save this</p>
                  <p className="text-xs text-faint">Email, Google, or X. Seven days for a dollar.</p>
                </div>
                <Button asChild variant="gradient">
                  <Link to="/sign-up">Continue · $1 trial</Link>
                </Button>
              </div>
              <Button className="mt-4" variant="outline" onClick={finish}>
                I'm good — open today
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-border px-4 py-4 md:px-8">
        <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <p className="font-mono text-xs text-faint">
          {step + 1} / 5
        </p>
        <Button onClick={() => (step === 4 ? finish() : setStep(step + 1))} disabled={step === 4}>
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </footer>
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-accent">{children}</p>;
}

function ChoiceCard({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className="space-y-1.5">
        {options.map(([k, v]) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-sm",
              value === k ? "border border-accent bg-surface-2" : "border border-transparent",
            )}
          >
            <span
              className={cn(
                "size-[18px] rounded-full border-[1.5px]",
                value === k ? "border-accent bg-accent" : "border-border",
              )}
            />
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function firstPlan(dump: string): string[] {
  const bits = dump
    .split(/[\n.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && !/worr|enough|what if/i.test(s));
  const picked = bits.slice(0, 2);
  while (picked.length < 3) {
    const extras = ["Ten-minute walk", "Book dentist", "Morning pages"];
    const next = extras[picked.length];
    if (!picked.includes(next)) picked.push(next);
    else break;
  }
  return picked.slice(0, 3);
}
