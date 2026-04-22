"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PRIVACY_URL, TERMS_URL } from "@/config/appConfig";

const REMEMBERED_EMAIL_KEY = "remembered_email";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn?: () => void;
}

// Sign-up modal component.
export default function SignUpModal({ open, onOpenChange, onSwitchToSignIn }: SignUpModalProps) {
  const { signIn } = useAuthActions(); // Sign-up uses the same Convex Auth action as sign-in.
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
      setError("Please read and accept the Terms and Privacy Policy to continue.");
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

      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error.message || "";

      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("AccountAlreadyExists")
      ) {
        setError("An account with that email already exists — try signing in.");
      } else if (errorMessage.includes("password") && errorMessage.includes("weak")) {
        setError("That password is a bit light — try something stronger.");
      } else if (errorMessage.includes("TooManyRequests")) {
        setError("Too many attempts. Give it a minute and try again.");
      } else if (errorMessage.includes("invalid") && errorMessage.includes("email")) {
        setError("That email doesn't look right. Double-check it?");
      } else {
        setError("Couldn't create your account. Check your details and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignIn = () => {
    onOpenChange(false);
    onSwitchToSignIn?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-linear-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-0">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-white text-center">
              Create your account
            </DialogTitle>
            <p className="text-gray-400 text-center mt-2">A calm home for your plan, your way.</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="signup-modal-email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="signup-modal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="you@example.com"
                required={true}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="signup-modal-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-modal-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required={true}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="signup-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800 cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="signup-remember-me" className="text-sm text-gray-300 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
              <div className="relative flex-shrink-0 mt-0.5">
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
                  className={`w-5 h-5 flex items-center justify-center rounded border-2 transition ${
                    consentAccepted
                      ? "bg-orange-500 border-orange-500"
                      : "bg-transparent border-gray-600 hover:border-gray-500"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  aria-label={consentAccepted ? "Consent granted" : "Accept terms"}
                >
                  {consentAccepted && <Check className="w-3 h-3 text-black" />}
                </button>
              </div>
              <label
                htmlFor="signup-consent"
                className="text-sm text-gray-300 flex-1 cursor-pointer"
              >
                I agree to the{" "}
                <Link
                  href={TERMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400 font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Use
                </Link>
                {" "}and{" "}
                <Link
                  href={PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400 font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !consentAccepted}
              className="w-full bg-linear-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating account…</span>
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={handleSwitchToSignIn}
              className="text-orange-500 hover:text-orange-400 font-semibold transition"
            >
              Sign in
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
