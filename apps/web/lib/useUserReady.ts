"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * True once the Convex app user row exists. Queries that call requireUser throw until then,
 * while getProfile returns null instead, so gate those subscriptions on this flag.
 */
export function useUserReady(): boolean {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  return isAuthenticated && Boolean(profile);
}
