/**
 * @screen: sign-in
 * @category: Auth (bare route)
 * @source: docs/design/claude-export/design-system/landing.html (Sign in CTA) + Convex Auth
 * @mutations: signIn via @convex-dev/auth password provider
 * @routes-to: /dashboard on success (existing behavior)
 * @auth: public
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";
import { SoftCard } from "@tempo/ui/primitives";

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
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

  return (
    <div className="grain-bg flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4 text-left">
          <p className="font-eyebrow text-muted-foreground">Tempo Flow</p>
          <h1 className="text-h1 font-serif text-foreground">Sign in, gently.</h1>
          <p className="text-body leading-relaxed text-muted-foreground">
            Same account across web and mobile. Convex Auth handles credentials — no third-party auth
            vendors.
          </p>
          {/*
            @action goToOnboarding
            @navigate: /onboarding
            @auth: public
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-body font-medium text-foreground hover:bg-surface-sunken"
          >
            New here? Start the walk
          </Link>
        </div>
        <SoftCard padding="lg" className="w-full">
          {/*
            @action submitPasswordSignIn
            @mutation: auth password signIn (Convex Auth)
            @index: users.by_email
            @auth: public
            @errors: inline (SignInForm)
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <SignInForm variant="page" />
        </SoftCard>
      </div>
    </div>
  );
}
