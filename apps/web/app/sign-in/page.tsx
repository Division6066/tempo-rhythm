"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

/**
 * @screen: sign-in
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 37, §15
 * @source: docs/design/claude-export/design-system/screens-7.jsx
 * @summary: Account entry for web users before tempo shell.
 */
export default function SignInPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [isAuthCheckDelayed, setIsAuthCheckDelayed] = useState(false);
  const isBackendAuthConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsAuthCheckDelayed(true);
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    /*
     * @behavior: If user identity already exists, bypass sign-in and route to dashboard shell.
     * @navigate: /dashboard
     * @convex-query-needed: auth.currentUserIdentity
     * @prd: PRD §4 Screen 37
     * @source: docs/design/claude-export/design-system/screens-7.jsx
     */
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const isAuthUnavailable = !isBackendAuthConfigured;

  if (isAuthUnavailable) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-xl flex-col gap-4 px-6 py-14">
        <h1 className="text-h1 font-serif">Sign in is temporarily unavailable.</h1>
        <p className="text-body text-muted-foreground">
          The frontend design is available, but the auth backend is not configured in this preview environment.
        </p>
        {/*
         * @behavior: Allow users to continue browsing public marketing and design-preview surfaces when auth is unavailable.
         * @navigate: /
         * @errors: show fallback state instead of infinite spinner when Convex auth URL is missing
         * @prd: PRD §4 Screen 37, §15
         * @source: docs/design/claude-export/design-system/screens-7.jsx
         */}
        <a href="/" className="text-small text-muted-foreground underline-offset-4 hover:underline">
          Back to home
        </a>
      </main>
    );
  }

  if (isLoading && !isAuthCheckDelayed) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  /*
   * @behavior: Render sign-in form so user can submit credentials and create authenticated session.
   * @convex-action-needed: auth.signIn
   * @navigate: /dashboard
   * @provider-needed: convex-auth
   * @confirm: none
   * @prd: PRD §4 Screen 37, §15
   * @source: docs/design/claude-export/design-system/screens-7.jsx
   */
  return (
    <div className="grain-bg flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      {isLoading && isAuthCheckDelayed ? (
        <p className="mb-4 rounded-xl border border-border-soft bg-card px-4 py-2 text-center text-small text-muted-foreground">
          Auth connection is taking longer than expected. You can still try signing in.
        </p>
      ) : null}
      <SignInForm variant="page" />
    </div>
  );
}
