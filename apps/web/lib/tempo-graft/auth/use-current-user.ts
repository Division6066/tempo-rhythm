"use client";

import { api } from "@/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";

export type GraftUser = {
  id: string;
  name: string;
  primaryEmail: string;
};

export function useCurrentUserState(): {
  user: GraftUser | null;
  isPending: boolean;
} {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && profile === undefined)) {
    return { user: null, isPending: true };
  }
  if (!isAuthenticated || !profile) {
    return { user: null, isPending: false };
  }
  return {
    user: {
      id: profile._id,
      name: profile.fullName?.trim() || profile.email?.split("@")[0] || "You",
      primaryEmail: profile.email ?? "",
    },
    isPending: false,
  };
}

export function useCurrentUser(): GraftUser | null {
  return useCurrentUserState().user;
}
