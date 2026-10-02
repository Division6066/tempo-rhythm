"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Check } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { PRIVACY_URL, TERMS_URL } from "@/config/appConfig";

export type SignInFormProps = {
  /** Page layout uses Soft Editorial; modal keeps compact dark styling */
  variant?: "page" | "modal";
  nextPath?: string;
  /** "sign-up" only changes the copy; both flows send the same magic link. */
  flow?: "sign-in" | "sign-up";
  onSuccess?: () => void;
  onSwitch?: () => void;
};

/**
 * Magic-link only auth form (Convex Auth Resend provider).
 * The same link signs in an existing account or creates a new one.
 */
export function SignInForm({
  variant = "modal",
  nextPath,
  flow = "sign-in",
  onSuccess,
  onSwitch,
}: SignInFormProps) {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const isPage = variant === "page";
  const isSignUp = flow === "sign-up";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !consentAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await signIn("resend", {
        email,
        ...(nextPath ? { redirectTo: nextPath } : {}),
      });
      setMagicLinkSent(true);
      onSuccess?.();
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "";
      if (message.includes("TooManyRequests")) {
        setError("You've tried a few times. Please pause for a moment and try again.");
      } else {
        setError("We couldn't send the link yet. Please check your email and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const otherHref = (pathname: string) =>
    nextPath ? { pathname, query: { next: nextPath } } : pathname;

  const inputClass = isPage
    ? "w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-primary"
    : "w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition";

  const labelClass = isPage
    ? "mb-2 block text-sm font-medium text-foreground"
    : "block text-sm font-medium text-gray-300 mb-2";

  const linkClass = isPage
    ? "font-semibold text-primary hover:underline"
    : "font-semibold text-orange-500 transition hover:text-orange-400";

  if (magicLinkSent) {
    return (
      <div className={isPage ? "w-full max-w-md text-center" : "text-center"}>
        {isPage && (
          <div className="mb-8 text-center">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-gradient-primary">
              Check your email
            </h1>
          </div>
        )}
        <p className={`mb-6 ${isPage ? "text-muted-foreground" : "text-gray-400"}`}>
          We sent a sign-in link to <strong>{email}</strong>. Open it on any device to continue.
        </p>
        <button
          type="button"
          onClick={() => {
            setMagicLinkSent(false);
            setError("");
          }}
          className={`text-sm ${isPage ? "text-primary hover:underline" : "text-orange-500 hover:text-orange-400 transition"}`}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className={isPage ? "w-full max-w-md" : ""}>
      {isPage && (
        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-gradient-primary">
            {isSignUp ? "Create account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isSignUp ? "Join Tempo Flow — free to start" : "Sign in to Tempo Flow"}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor={`${flow}-email`} className={labelClass}>
            Email
          </label>
          <input
            id={`${flow}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
            required={true}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        {isSignUp ? (
          <div
            className={
              isPage
                ? "flex items-start gap-3 rounded-xl border border-border bg-card/80 p-4"
                : "flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-900/30 p-4"
            }
          >
            <div className="relative mt-0.5 shrink-0">
              <input
                id="signup-consent"
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="sr-only"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setConsentAccepted(!consentAccepted)}
                disabled={isLoading}
                aria-pressed={consentAccepted}
                aria-label="Accept terms and privacy policy"
                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                  consentAccepted
                    ? "border-primary bg-primary"
                    : isPage
                      ? "border-border bg-transparent hover:border-muted-foreground"
                      : "border-gray-600 bg-transparent hover:border-gray-500"
                } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                {consentAccepted ? <Check className="h-3 w-3 text-primary-foreground" /> : null}
              </button>
            </div>
            <label
              htmlFor="signup-consent"
              className="flex-1 cursor-pointer text-sm text-foreground"
            >
              I agree to the{" "}
              <Link
                href={TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href={PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
              .
            </label>
          </div>
        ) : null}

        {error && (
          <div
            className={
              isPage
                ? "rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                : "bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm"
            }
            role="alert"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (isSignUp && !consentAccepted)}
          className={
            isPage
              ? "w-full rounded-xl bg-linear-to-r from-[#D97757] to-[#E8A87C] py-3 font-semibold text-primary-foreground shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              : "w-full bg-linear-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          }
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Sending link…
            </span>
          ) : (
            "Send magic link"
          )}
        </button>
      </form>

      <p
        className={`mt-6 text-center text-sm ${isPage ? "text-muted-foreground" : "text-gray-400"}`}
      >
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        {isPage ? (
          <Link href={otherHref(isSignUp ? "/sign-in" : "/sign-up")} className={linkClass}>
            {isSignUp ? "Sign in" : "Create one"}
          </Link>
        ) : (
          <button type="button" onClick={() => onSwitch?.()} className={linkClass}>
            {isSignUp ? "Sign in" : "Create one"}
          </button>
        )}
      </p>
    </div>
  );
}
