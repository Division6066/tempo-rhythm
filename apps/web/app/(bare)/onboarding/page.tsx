/**
 * @screen: onboarding
 * @category: Onboarding
 * @source: docs/design/claude-export/design-system/screens-7.jsx (flow cues)
 * @summary: Five-step onboarding — welcome, personalization, template pick, first brain dump, first plan.
 * @mutations: users.completeOnboarding @table users @index by_deletedAt
 * @routes-to: /today
 * @auth: public (pre-account) or required (resume) — Convex Auth resolves in Long Run 2
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

const steps = [
  {
    title: "Welcome",
    body: "Tempo is a quiet place for messy brains. No streak shame, no hustle language — just the next small thing.",
  },
  {
    title: "Personalization",
    body: "Pick a warmth dial and theme. You can change this anytime in settings.",
  },
  {
    title: "Pick a template",
    body: "Start with Weekly Review or Morning Pages — both are gentle on-rails.",
  },
  {
    title: "First brain dump",
    body: "Type everything on your mind. Sorting comes after you breathe.",
  },
  {
    title: "First plan",
    body: "Coach suggests a light day — you approve every block.",
  },
] as const;

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("ready");
  const [step, setStep] = useState(0);

  const isLast = step === steps.length - 1;

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center p-6 pb-24 md:p-8">
        <p className="mb-2 font-eyebrow text-muted-foreground">
          Step {step + 1} of {steps.length}
        </p>
        <SoftCard padding="lg" className="space-y-4">
          <h1 className="text-h1 font-serif text-foreground">{steps[step].title}</h1>
          <p className="text-body leading-relaxed text-muted-foreground">{steps[step].body}</p>
          <div className="flex flex-wrap gap-2 pt-4">
            {/*
              @action onboardingBack
              @mutation: none
              @navigate: none
              @auth: public
              @env: NEXT_PUBLIC_CONVEX_URL
            */}
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </Button>
            {!isLast ? (
              <Button type="button" variant="primary" onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <>
                {/*
                  @action completeOnboarding
                  @mutation: users.completeOnboarding @index by_email
                  @navigate: /today
                  @auth: required
                  @errors: toast
                  @env: NEXT_PUBLIC_CONVEX_URL
                */}
                <Button type="button" variant="primary" onClick={() => router.push("/today")}>
                  Enter Tempo
                </Button>
              </>
            )}
          </div>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
