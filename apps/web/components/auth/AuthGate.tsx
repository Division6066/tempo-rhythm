"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@tempo/ui/primitives";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.getCurrentUser);
  const router = useRouter();
  const { signOut } = useAuthActions();

  useEffect(() => {
    // Note: convex/auth.ts createOrUpdateUser assigns betaAccess based on
    // process.env flags. Wait for convex query before attempting redirect.
    if (user === null) {
      // User is explicitly unauthenticated
      router.push("/sign-in");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <span className="font-eyebrow animate-pulse">Loading...</span>
      </div>
    );
  }

  if (user === null) {
    // Caught by useEffect, but avoid rendering children flash
    return null;
  }

  // The database marks them as tester or founder if they were permitted
  const isApproved = user.betaAccess === "tester" || user.betaAccess === "founder";

  if (!isApproved) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-background text-foreground px-4 text-center">
        <h1 className="font-display text-2xl">Almost there</h1>
        <p className="text-muted-foreground font-serif max-w-md">
          Tempo Flow is currently in a closed beta with limited capacity. We have received your account details and will send you an email as soon as a spot opens up for you.
        </p>
        <Button onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
