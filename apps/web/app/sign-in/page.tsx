"use client";

import { useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

function getPostAuthDestination(nextPath: string | null) {
  const trimmed = nextPath?.trim();

  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/today";
  }

  if (
    trimmed === "/dashboard" ||
    trimmed.startsWith("/dashboard?") ||
    trimmed.startsWith("/dashboard/") ||
    trimmed === "/sign-in" ||
    trimmed.startsWith("/sign-in?") ||
    trimmed === "/sign-up" ||
    trimmed.startsWith("/sign-up?")
  ) {
    return "/today";
  }

  return trimmed;
}

export default function SignInPage() {
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getPostAuthDestination(searchParams.get("next"));

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, nextPath, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="grain-bg flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <SignInForm variant="page" nextPath={nextPath} />
    </div>
  );
}
