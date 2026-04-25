"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

const REMEMBERED_EMAIL_KEY = "remembered_email";

export type SignInFormProps = {
  /** Page layout uses Soft Editorial; modal keeps compact dark styling */
  variant?: "page" | "modal";
  nextPath?: string;
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
};

export function SignInForm({
  variant = "modal",
  nextPath,
  onSuccess,
  onSwitchToSignUp,
}: SignInFormProps) {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signIn("password", { email, password, flow: "signIn" });
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error.message || "";
      if (errorMessage.includes("InvalidSecret")) {
        setError("That password doesn't match yet. Please try again.");
      } else if (
        errorMessage.includes("InvalidAccountId") ||
        errorMessage.includes("Could not find")
      ) {
        setError("We couldn't find an account for that email yet.");
      } else if (errorMessage.includes("TooManyRequests")) {
        setError("You've tried a few times. Please pause for a moment and try again.");
      } else if (errorMessage.includes("Beta access is invite-only")) {
        setError("Beta access is invite-only right now. Ask for an invite and we'll add you.");
      } else if (errorMessage.includes("All beta seats are currently filled")) {
        setError("All beta seats are currently filled. We can add you to the next wave.");
      } else {
        setError("We couldn't sign you in yet. Please check your details and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signIn("email", {
        email,
        ...(nextPath ? { redirectTo: nextPath } : {}),
      });
      setMagicLinkSent(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error.message || "";
      if (errorMessage.includes("TooManyRequests")) {
        setError("You've tried a few times. Please pause for a moment and try again.");
      } else if (errorMessage.includes("Beta access is invite-only")) {
        setError("Beta access is invite-only right now. Ask for an invite and we'll add you.");
      } else if (errorMessage.includes("All beta seats are currently filled")) {
        setError("All beta seats are currently filled. We can add you to the next wave.");
      } else {
        setError("We couldn't send the link yet. Please check your email and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = mode === "password" ? handlePasswordSubmit : handleMagicLinkSubmit;

  const isPage = variant === "page";
  const signUpHref = nextPath
    ? { pathname: "/sign-up", query: { next: nextPath } }
    : "/sign-up";

  const inputClass = isPage
    ? "w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-primary"
    : "w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition";

  const labelClass = isPage ? "mb-2 block text-sm font-medium text-foreground" : "block text-sm font-medium text-gray-300 mb-2";

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
          onClick={() => { setMagicLinkSent(false); setError(""); }}
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
            Welcome back
          </h1>
          <p className="mt-2 text-muted-foreground">Sign in to Tempo Flow</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="signin-email" className={labelClass}>
            Email
          </label>
          <input
            id="signin-email"
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

        {mode === "password" && (
          <>
            <div>
              <label htmlFor="signin-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                  required={true}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={
                    isPage
                      ? "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      : "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
                  }
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="remember-me-signin"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={
                  isPage
                    ? "h-4 w-4 cursor-pointer rounded border-border text-primary focus:ring-primary"
                    : "w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800 cursor-pointer"
                }
                disabled={isLoading}
              />
              <label htmlFor="remember-me-signin" className={`cursor-pointer text-sm ${isPage ? "text-foreground" : "text-gray-300"}`}>
                Remember me
              </label>
            </div>
          </>
        )}

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
          disabled={isLoading}
          className={
            isPage
              ? "w-full rounded-xl bg-linear-to-r from-[#D97757] to-[#E8A87C] py-3 font-semibold text-primary-foreground shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              : "w-full bg-linear-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          }
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {mode === "magic-link" ? "Sending link…" : "Signing in…"}
            </span>
          ) : (
            mode === "magic-link" ? "Send magic link" : "Sign in"
          )}
        </button>
      </form>

      <div className={`mt-4 text-center text-sm ${isPage ? "text-muted-foreground" : "text-gray-400"}`}>
        <button
          type="button"
          onClick={() => { setMode(mode === "password" ? "magic-link" : "password"); setError(""); }}
          className={`${isPage ? "text-primary hover:underline" : "text-orange-500 hover:text-orange-400 transition"}`}
        >
          {mode === "password" ? "Use a magic link instead" : "Use password instead"}
        </button>
      </div>

      <p className={`mt-4 text-center text-sm ${isPage ? "text-muted-foreground" : "text-gray-400"}`}>
        Don&apos;t have an account?{" "}
        {isPage ? (
          <Link href={signUpHref} className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onSwitchToSignUp?.()}
            className="font-semibold text-orange-500 transition hover:text-orange-400"
          >
            Create one
          </button>
        )}
      </p>
    </div>
  );
}
