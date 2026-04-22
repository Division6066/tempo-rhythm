"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { PRIVACY_URL, TERMS_URL } from "@/config/appConfig";

const REMEMBERED_EMAIL_KEY = "remembered_email";

export type SignUpFormProps = {
  variant?: "page" | "modal";
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
};

export function SignUpForm({ variant = "modal", onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await signIn("password", { email, password, flow: "signUp" });
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("AccountAlreadyExists")
      ) {
        setError("An account with that email already exists. Try signing in instead.");
      } else if (errorMessage.includes("password") && errorMessage.includes("weak")) {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (errorMessage.includes("TooManyRequests")) {
        setError("Too many attempts. Please try again later.");
      } else if (errorMessage.includes("invalid") && errorMessage.includes("email")) {
        setError("That email address doesn't look valid. Please check it.");
      } else {
        setError("Sign-up failed. Please check your details and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isPage = variant === "page";

  const inputClass = isPage
    ? "w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-primary"
    : "w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition";

  const labelClass = isPage
    ? "mb-2 block text-sm font-medium text-foreground"
    : "block text-sm font-medium text-gray-300 mb-2";

  return (
    <div className={isPage ? "w-full max-w-md" : ""}>
      {isPage && (
        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-gradient-primary">
            Create account
          </h1>
          <p className="mt-2 text-muted-foreground">Join Tempo Flow — free to start</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="signup-email" className={labelClass}>
            Email
          </label>
          <input
            id="signup-email"
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

        <div>
          <label htmlFor="signup-password" className={labelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={isPage ? `${inputClass} pr-12` : `${inputClass} pr-12`}
              placeholder="••••••••"
              required={true}
              disabled={isLoading}
              autoComplete="new-password"
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
            id="remember-me-signup"
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
          <label
            htmlFor="remember-me-signup"
            className={`cursor-pointer text-sm ${isPage ? "text-foreground" : "text-gray-300"}`}
          >
            Remember me
          </label>
        </div>

        <div
          className={
            isPage
              ? "flex items-start gap-3 rounded-xl border border-border bg-card/80 p-4"
              : "flex items-start gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700"
          }
        >
          <div className="relative mt-0.5 flex-shrink-0">
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
              aria-label="Accept terms and privacy policy"
              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                consentAccepted
                  ? "border-primary bg-primary"
                  : isPage
                    ? "border-border bg-transparent hover:border-muted-foreground"
                    : "bg-transparent border-gray-600 hover:border-gray-500"
              } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {consentAccepted && <Check className="h-3 w-3 text-primary-foreground" />}
            </button>
          </div>
          <label htmlFor="signup-consent" className="flex-1 cursor-pointer text-sm text-foreground">
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
          </label>
        </div>

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
          disabled={isLoading || !consentAccepted}
          className={
            isPage
              ? "w-full rounded-xl bg-linear-to-r from-[#D97757] to-[#E8A87C] py-3 font-semibold text-primary-foreground shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              : "w-full bg-linear-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          }
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className={`mt-6 text-center text-sm ${isPage ? "text-muted-foreground" : "text-gray-400"}`}>
        Already have an account?{" "}
        {isPage ? (
          <Link href="/sign-in" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onSwitchToSignIn?.()}
            className="font-semibold text-orange-500 transition hover:text-orange-400"
          >
            Sign in
          </button>
        )}
      </p>
    </div>
  );
}
