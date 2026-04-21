"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const isAuthUnavailable = !process.env.NEXT_PUBLIC_CONVEX_URL;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isAuthUnavailable) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-xl flex-col gap-4 px-6 py-14">
        <h1 className="text-h1 font-serif">Sign up is temporarily unavailable.</h1>
        <p className="text-body text-muted-foreground">
          The frontend design is available, but the auth backend is not configured in this preview environment.
        </p>
        <a href="/" className="text-small text-muted-foreground underline-offset-4 hover:underline">
          Back to home
        </a>
      </main>
    );
  }

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
      <SignUpForm variant="page" />
    </div>
  );
}
