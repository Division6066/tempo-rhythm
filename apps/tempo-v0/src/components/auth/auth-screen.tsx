import { Link, Navigate } from "@/lib/tempo-graft/router";
import { useState, type FormEvent, type ReactNode } from "react";
import { BrandMark, Wordmark } from "@tempo-v0/components/tempo/brand";
import { Button } from "@tempo-v0/components/ui/button";
import { Input } from "@tempo-v0/components/ui/input";
import { Label } from "@tempo-v0/components/ui/label";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/tempo-graft/auth/client";
import { useCurrentUserState } from "@/lib/tempo-graft/auth/use-current-user";

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const { user, isPending } = useCurrentUserState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg">
        <div className="h-24 w-72 animate-pulse rounded-xl bg-surface-2" />
      </main>
    );
  }
  if (user) return <Navigate to={mode === "signup" ? "/onboarding" : "/today"} />;

  const after = mode === "signup" ? "/onboarding" : "/today";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0],
          callbackURL: after,
        });
        if (err) throw new Error(err.message ?? "Could not create the account.");
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: after,
        });
        if (err) throw new Error(err.message ?? "Could not sign in.");
      }
      window.location.href = after;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-dvh bg-bg text-ink">
      <section className="relative z-10 flex min-h-dvh flex-col justify-between px-6 py-10 md:px-12 md:py-16 lg:w-1/2">
        <Link to="/" className="flex items-center gap-2.5">
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
          {authEnabled ? (
            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "signup" ? (
                <Field label="Name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </Field>
              ) : null}
              <Field label="Email">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </Field>
              {error ? <p className="text-sm text-overdue">{error}</p> : null}
              <Button type="submit" variant="gradient" className="w-full" disabled={busy} size="lg">
                {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
          {authEnabled ? (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-faint">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-2">
                {GROK_PROVIDERS.map((p) => (
                  <Button
                    key={p.providerId}
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => signIn(p.providerId, { callbackURL: after })}
                  >
                    Continue with {p.label}
                  </Button>
                ))}
              </div>
            </>
          ) : null}
          <p className="mt-6 text-sm text-muted">
            {mode === "login" ? (
              <>
                New here?{" "}
                <Link to="/sign-up" className="text-accent">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link to="/login" className="text-accent">
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
