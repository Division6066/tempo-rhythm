"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import type { ReactNode } from "react";
import { useCurrentUserState } from "./use-current-user";

export function SignedIn({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending || !user) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending || user) return null;
  return <>{children}</>;
}

export function UserButton() {
  const { signOut } = useAuthActions();
  const { user } = useCurrentUserState();
  const initial = (user?.name || user?.primaryEmail || "?").slice(0, 1).toUpperCase();
  return (
    <button
      type="button"
      onClick={() => void signOut()}
      title={user?.primaryEmail || "Sign out"}
      className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-fg"
    >
      {initial}
    </button>
  );
}
