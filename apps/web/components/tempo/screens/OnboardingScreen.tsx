"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, Ring, SoftCard } from "@tempo/ui/primitives";
import { mockOnboarding } from "@tempo/mock-data";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * OnboardingScreen — 5-step walkthrough. Bare layout.
 * @source docs/design/claude-export/design-system/screens-7.jsx (ScreenOnboarding)
 */
export function OnboardingScreen() {
  const router = useRouter();
  const toast = useDemoToast();
  const [step, setStep] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [template, setTemplate] = useState<string | null>(null);
  const [dump, setDump] = useState("");

  const totalSteps = mockOnboarding.steps.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const next = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      /*
       * @behavior: Commit onboarding selections and route into Today.
       * @convex-mutation-needed: users.completeOnboarding
       * @convex-action-needed: brainDumps.processInitialDump
       * @provider-needed: revenuecat
       */
      toast("Finished. (demo) users.completeOnboarding.");
      router.push("/today");
    }
  };

  const stepName = mockOnboarding.steps[step];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ring size={48} value={step + 1} max={totalSteps}>
            <span className="font-tabular text-small">
              {step + 1}/{totalSteps}
            </span>
          </Ring>
          <div>
            <div className="font-eyebrow">{Math.round(progress)}% done</div>
            <h1 className="font-serif text-h3">{stepName}</h1>
          </div>
        </div>
        <Pill tone="orange">onboarding</Pill>
      </header>

      <SoftCard tone="default" padding="lg">
        {step === 0 ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-h2">Welcome. Take a breath.</h2>
            <p className="text-body text-muted-foreground">
              Tempo is an overwhelm-first daily planner. We'll spend a couple of
              minutes setting things up — one gentle step at a time.
            </p>
            <p className="text-small text-muted-foreground">
              You can quit at any point without losing progress.
            </p>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-h2">A little about you.</h2>
            <p className="text-small text-muted-foreground">
              Pick any that fit. These stay private and only change how Tempo
              phrases things.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {mockOnboarding.profileTags.map((tag) => {
                const active = tags.includes(tag);
                return (
                  /*
                   * @behavior: Toggle a profile tag; used to tune tone.
                   * @convex-mutation-needed: profiles.setOnboardingPreferences
                   * @schema-delta: profiles.neurodivergentTags
                   */
                  <Button
                    key={tag}
                    variant={active ? "primary" : "subtle"}
                    size="sm"
                    onClick={() =>
                      setTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag],
                      )
                    }
                  >
                    {tag}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-h2">Pick a starting template.</h2>
            <p className="text-small text-muted-foreground">
              You can always change this later, or start blank.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {mockOnboarding.templateOptions.map((t) => {
                const active = template === t;
                return (
                  /*
                   * @behavior: Select starting template.
                   * @convex-mutation-needed: users.setOnboardingTemplate
                   */
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={[
                      "rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-card"
                        : "border-border-soft bg-surface-sunken hover:bg-surface",
                    ].join(" ")}
                  >
                    <div className="font-serif text-h4">{t}</div>
                    <div className="mt-1 text-caption text-muted-foreground">
                      {active ? "selected" : "tap to choose"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-h2">First brain dump.</h2>
            <p className="text-small text-muted-foreground">
              Just type. Don't organize. Tempo will sort it on the next step.
            </p>
            <textarea
              value={dump}
              onChange={(e) => setDump(e.target.value)}
              rows={8}
              placeholder="Everything on your mind right now…"
              className="mt-2 w-full resize-y rounded-lg border border-border-soft bg-surface-sunken p-3 font-serif text-body focus:border-primary focus:outline-none"
              /*
               * @behavior: RAM-only textarea; processed on step advance.
               * @convex-action-needed: brainDump.processInitialDump
               * @provider-needed: openrouter
               */
            />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-h2">You're set.</h2>
            <p className="text-body text-muted-foreground">
              Three anchors staged for today based on your dump. You can tweak
              them before the day really starts.
            </p>
            <ul className="mt-2 flex flex-col gap-2 text-small">
              <li className="flex items-center gap-2 rounded-lg bg-surface-sunken p-3">
                <Pill tone="orange">task</Pill> Ship mobile preview v1
              </li>
              <li className="flex items-center gap-2 rounded-lg bg-surface-sunken p-3">
                <Pill tone="orange">task</Pill> Review PR from Sam
              </li>
              <li className="flex items-center gap-2 rounded-lg bg-surface-sunken p-3">
                <Pill tone="orange">task</Pill> Call the dentist
              </li>
            </ul>
            <p className="text-caption text-muted-foreground">
              Welcome to Tempo. Nothing to prove, nothing to catch up on.
            </p>
          </div>
        ) : null}
      </SoftCard>

      <div className="flex items-center justify-between">
        {/*
         * @behavior: Go back a step; never destructive.
         * @convex-query-needed: users.getOnboardingState
         */}
        <Button
          variant="ghost"
          size="md"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          ← Back
        </Button>
        <div className="flex items-center gap-2">
          {mockOnboarding.steps.map((label, i) => (
            <span
              key={label}
              className={[
                "h-2 w-6 rounded-full",
                i <= step ? "bg-primary" : "bg-surface-sunken",
              ].join(" ")}
              aria-hidden
            />
          ))}
        </div>
        <Button variant="primary" size="md" onClick={next}>
          {step < totalSteps - 1 ? "Continue →" : "Enter Tempo"}
        </Button>
      </div>
    </div>
  );
}
