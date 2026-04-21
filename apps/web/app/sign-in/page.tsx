"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { IS_DEMO_MODE } from "@/lib/demo-mode";

/**
 * @screen: sign-in
 * @category: Onboarding
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 37, §15
 * @source: docs/design/claude-export/design-system/screens-7.jsx
 * @summary: Account entry for web users before tempo shell. In demo mode, a
 * friendly "Enter the demo" CTA replaces the real sign-in form so every route
 * is clickable without a Convex backend.
 */
export default function SignInPage() {
  const router = useRouter();
  const [isAuthCheckDelayed, setIsAuthCheckDelayed] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsAuthCheckDelayed(true);
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, []);

  if (IS_DEMO_MODE) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center gap-6 px-6 py-14">
        <SoftCard tone="default" className="flex flex-col gap-4 p-8">
          <span className="font-eyebrow">Demo mode</span>
          <h1 className="text-h1 font-serif">No account needed.</h1>
          <p className="text-body text-muted-foreground">
            You're running Tempo Flow in frontend-only demo mode. Every screen
            is reachable, data is mocked, and no backend is required. When
            <code className="mx-1 rounded bg-surface-sunken px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_CONVEX_URL
            </code>
            is set, this page becomes the real sign-in form.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {/*
             * @behavior: Enter the tempo app shell straight into Today.
             * @navigate: /today
             * @convex-query-needed: auth.currentUserIdentity (when not in demo mode)
             * @source: apps/web/lib/demo-mode.ts
             */}
            <Link href="/today">
              <Button variant="primary" size="lg">
                Enter the demo
              </Button>
            </Link>
            {/*
             * @behavior: Start the onboarding walkthrough from the demo landing.
             * @navigate: /onboarding
             * @convex-mutation-needed: users.startOnboardingSession
             * @source: docs/design/claude-export/design-system/screens-7.jsx
             */}
            <Link href="/onboarding">
              <Button variant="ghost" size="lg">
                Try the onboarding
              </Button>
            </Link>
          </div>
        </SoftCard>
        <div className="text-caption text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  // Non-demo path: real sign-in form.
  return (
    <div className="grain-bg flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      {isAuthCheckDelayed ? (
        <p className="mb-4 rounded-xl border border-border-soft bg-card px-4 py-2 text-center text-small text-muted-foreground">
          Auth connection is taking longer than expected. You can still try
          signing in — or {" "}
          <button
            type="button"
            className="underline-offset-4 hover:underline"
            onClick={() => router.push("/today")}
          >
            enter as a demo user
          </button>
          .
        </p>
      ) : null}
      <SignInForm variant="page" />
    </div>
  );
}
