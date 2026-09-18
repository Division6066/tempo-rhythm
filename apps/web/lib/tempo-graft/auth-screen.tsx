"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { BrandMark, Wordmark } from "@tempo-v0/components/tempo/brand";
import { Button } from "@tempo-v0/components/ui/button";
import { Input } from "@tempo-v0/components/ui/input";
import { Label } from "@tempo-v0/components/ui/label";
import { useCurrentUserState } from "./auth/use-current-user";

export function GraftAuthScreen({ mode }: { mode: "login" | "signup" }) {
  const { user, isPending } = useCurrentUserState();
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const after = mode === "signup" ? "/onboarding" : "/today";

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg">
        <div className="h-24 w-72 animate-pulse rounded-xl bg-surface-2" />
      </main>
    );
  }
  if (user) {
    router.replace(after);
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn("email", { email, redirectTo: after });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-dvh bg-bg text-ink">
      <section className="relative z-10 flex min-h-dvh flex-col justify-between px-6 py-10 md:px-12 md:py-16 lg:w-1/2">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <Wordmark />
        </Link>
        <div className="mx-auto w-full max-w-[420px] py-10">
          <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
            {mode === "login" ? "Welcome back." : "Start your week."}
          </h1>
          <p className="mt-3 mb-8 font-display text-lg leading-relaxed text-muted">
            {mode === "login"
              ? "Your brain's operating system, where you left it."
              : "Seven days for a dollar. Cancel in two taps. No hustle copy."}
          </p>
          {sent ? (
            <p className="text-sm leading-relaxed text-muted">
              We sent a sign-in link to <strong className="text-ink">{email}</strong>.
              Open it on this device to continue to the planner.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <Field label="Email">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              {error ? <p className="text-sm text-overdue">{error}</p> : null}
              <Button type="submit" variant="gradient" className="w-full" disabled={busy} size="lg">
                {busy ? "Sending…" : "Email me a sign-in link"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-sm text-muted">
            {mode === "login" ? (
              <>
                New here?{" "}
                <Link href="/sign-up" className="text-accent">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-accent">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
        <p className="text-xs text-faint">By continuing, you agree to a seven-day, $1 trial. Cancel any time.</p>
      </section>
      <aside className="absolute inset-y-0 right-0 hidden w-1/2 tempo-gradient flex-col justify-center px-12 py-16 text-accent-fg lg:flex">
        <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent-fg/80">
          A letter, not a form
        </p>
        <p className="max-w-[22ch] font-display text-4xl leading-snug tracking-tight">
          "10 minute walk" beats "some movement." Small, gentle, specific — that's the whole planner.
        </p>
        <div className="mt-8 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-accent-fg/25 font-display font-semibold">
            A
          </span>
          <div>
            <p className="font-medium">Amit Levin</p>
            <p className="text-sm text-accent-fg/80">Founder · dogfooding Tempo 1.0</p>
          </div>
        </div>
      </aside>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
